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
      
      let mergedContent = undefined;
      const mergedLibManifestContent = {};

      if ('museLibs' in this.options) {
        const referencedMuseLibs = this.options.museLibs;
        for (const refMuseLib of referencedMuseLibs) {
          const currentMuseLibManifestContent = require(resolveCwd(`${refMuseLib.name}/build/${this.options.isDevBuild ? 'dev' : 'dist'}/lib-manifest.json`)).content;
          Object.assign(
            mergedLibManifestContent,
            currentMuseLibManifestContent,
          );
          //libReferences[`${refMuseLib.name}@${refMuseLib.version}`] = Object.keys(currentMuseLibManifestContent);
        }
      }

      if (Object.keys(mergedLibManifestContent).length > 0) {
        if (!mergedContent) mergedContent = mergedLibManifestContent;
      }

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
        mergedContent,
        extensions: this.options.extensions,
        associatedObjectForCache: compiler.root,
      }).apply(normalModuleFactory);
    });
  }
}

module.exports = MuseReferencePlugin;
