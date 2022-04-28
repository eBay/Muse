'use strict';

const parseJson = require('json-parse-better-errors');
const WebpackError = require('webpack/lib/WebpackError');
const ExternalModuleFactoryPlugin = require('webpack/lib/ExternalModuleFactoryPlugin');
const DelegatedSourceDependency = require('webpack/lib/dependencies/DelegatedSourceDependency');
const makePathsRelative = require('webpack/lib/util/identifier').makePathsRelative;

const MuseDelegatedModuleFactoryPlugin = require('./MuseDelegatedModuleFactoryPlugin');

class MuseReferencePlugin {
  constructor(options) {
    this.options = options;
    this.options.type = 'require';
    this._compilationData = new WeakMap();
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(
      'MuseReferencePlugin',
      (compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(DelegatedSourceDependency, normalModuleFactory);
      },
    );

    compiler.hooks.beforeCompile.tapAsync('MuseReferencePlugin', (params, callback) => {
      if ('manifest' in this.options) {
        const manifest = this.options.manifest;
        if (typeof manifest === 'string') {
          compiler.inputFileSystem.readFile(manifest, (err, result) => {
            if (err) return callback(err);
            const data = {
              path: manifest,
              data: undefined,
              error: undefined,
            };
            // Catch errors parsing the manifest so that blank
            // or malformed manifest files don't kill the process.
            try {
              data.data = parseJson(result.toString('utf-8'));
            } catch (e) {
              // Store the error in the params so that it can
              // be added as a compilation error later on.
              const manifestPath = makePathsRelative(
                compiler.options.context,
                manifest,
                compiler.root,
              );
              data.error = new MuseManifestError(manifestPath, e.message);
            }
            this._compilationData.set(params, data);
            return callback();
          });
          return;
        }
      }
      return callback();
    });

    compiler.hooks.compile.tap('MuseReferencePlugin', (params) => {
      let name = this.options.name;
      let sourceType = this.options.sourceType;
      let content = 'content' in this.options ? this.options.content : undefined;
      if ('manifest' in this.options) {
        let manifestParameter = this.options.manifest;
        let manifest;
        if (typeof manifestParameter === 'string') {
          const data = this._compilationData.get(params);
          // If there was an error parsing the manifest
          // file, exit now because the error will be added
          // as a compilation error in the "compilation" hook.
          if (data.error) {
            return;
          }
          manifest = data.data;
        } else {
          manifest = manifestParameter;
        }
        if (manifest) {
          if (!name) name = manifest.name;
          if (!sourceType) sourceType = manifest.type;
          if (!content) content = manifest.content;
        }
      }
      /** @type {Externals} */
      // const externals = {};
      const source = 'muse-shared-modules';
      // externals[source] = 'muse';
      const normalModuleFactory = params.normalModuleFactory;
      // new ExternalModuleFactoryPlugin(sourceType || 'var', externals).apply(normalModuleFactory);
      new MuseDelegatedModuleFactoryPlugin({
        source: source,
        type: this.options.type,
        scope: this.options.scope,
        context: this.options.context || compiler.options.context,
        content,
        extensions: this.options.extensions,
        associatedObjectForCache: compiler.root,
      }).apply(normalModuleFactory);
    });

    compiler.hooks.compilation.tap('MuseReferencePlugin', (compilation, params) => {
      if ('manifest' in this.options) {
        let manifest = this.options.manifest;
        if (typeof manifest === 'string') {
          const data = this._compilationData.get(params);
          // If there was an error parsing the manifest file, add the
          // error as a compilation error to make the compilation fail.
          if (data.error) {
            compilation.errors.push(data.error);
          }
          compilation.fileDependencies.add(manifest);
        }
      }
    });
  }
}

class MuseManifestError extends WebpackError {
  constructor(filename, message) {
    super();

    this.name = 'MuseManifestError';
    this.message = `Muse manifest ${filename}\n${message}`;
  }
}

module.exports = MuseReferencePlugin;
