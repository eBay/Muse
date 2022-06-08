'use strict';

const ExternalModuleFactoryPlugin = require('webpack/lib/ExternalModuleFactoryPlugin');
const DelegatedSourceDependency = require('webpack/lib/dependencies/DelegatedSourceDependency');
const MuseDelegatedModuleFactoryPlugin = require('./MuseDelegatedModuleFactoryPlugin');
const MuseDepsManifestPlugin = require('./MuseDepsManifestPlugin');
const resolveCwd = require('resolve-cwd');

class MuseReferencePlugin {
  constructor(options) {
    this.options = options;
    this.options.type = 'require';
    this._compilationData = new WeakMap();
  }

  apply(compiler) {

    const libsManifestContent = {};
    const mergedLibManifestContent = {};

    if ('museLibs' in this.options) {
      for (const museLib of this.options.museLibs) {
        const currentMuseLibManifestContent =
          require(resolveCwd(`${museLib}/build/${this.options.isDevBuild ? 'dev' : 'dist'}/lib-manifest.json`)).content;

        libsManifestContent[`${museLib}`] = {
          version: require(resolveCwd(`${museLib}/package.json`)).version,
          content: currentMuseLibManifestContent,
        };

        Object.assign(
          mergedLibManifestContent,
          currentMuseLibManifestContent,
        );
      }
      new MuseDepsManifestPlugin({ libsManifestContent, ...this.options }).apply(compiler);
    }

    compiler.hooks.compilation.tap('MuseReferencePlugin', (compilation, { normalModuleFactory }) => {
      compilation.dependencyFactories.set(DelegatedSourceDependency, normalModuleFactory);
    });

    compiler.hooks.compile.tap('MuseReferencePlugin', (params) => {
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
        mergedContent: Object.keys(mergedLibManifestContent).length > 0 ? mergedLibManifestContent : undefined,
        extensions: this.options.extensions,
        associatedObjectForCache: compiler.root,
      }).apply(normalModuleFactory);
    });
  }
}

module.exports = MuseReferencePlugin;
