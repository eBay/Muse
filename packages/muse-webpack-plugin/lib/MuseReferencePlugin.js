'use strict';

const ExternalModuleFactoryPlugin = require('webpack/lib/ExternalModuleFactoryPlugin');
const DelegatedSourceDependency = require('webpack/lib/dependencies/DelegatedSourceDependency');
const MuseDelegatedModuleFactoryPlugin = require('./MuseDelegatedModuleFactoryPlugin');
const resolveCwd = require('resolve-cwd');

class MuseReferencePlugin {
  constructor(options) {
    this.options = options;
    this.options.type = 'require';
    this._compilationData = new WeakMap();
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('MuseReferencePlugin', (compilation, { normalModuleFactory }) => {
      compilation.dependencyFactories.set(DelegatedSourceDependency, normalModuleFactory);
    });

    compiler.hooks.compile.tap('MuseReferencePlugin', (params) => {
      let content = undefined;
      const libManifestContent = {};
      const libReferences = {};

      if ('museLibs' in this.options) {
        const referencedMuseLibs = this.options.museLibs;
        for (const refMuseLib of referencedMuseLibs) {
          const currentMuseLibManifestContent = require(resolveCwd(`${refMuseLib.libManifestPath}`)).content;
          Object.assign(
            libManifestContent,
            currentMuseLibManifestContent,
          );
          libReferences[`${refMuseLib.libName}@${refMuseLib.libVersion}`] = Object.keys(currentMuseLibManifestContent);
        }
      }

      if (Object.keys(libManifestContent).length > 0) {
        if (!content) content = libManifestContent;
      }

      const buffer = Buffer.from(JSON.stringify(libReferences, null, 2), 'utf8');
      compiler.intermediateFileSystem.writeFile(this.options.depsManifestPath, buffer, function () { });

      /** @type {Externals} */
      const externals = {};
      const source = 'muse-shared-modules';
      externals[source] = 'MUSE_GLOBAL.__shared__.require';
      const normalModuleFactory = params.normalModuleFactory;
      new ExternalModuleFactoryPlugin('var', externals).apply(normalModuleFactory);
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
  }
}

module.exports = MuseReferencePlugin;
