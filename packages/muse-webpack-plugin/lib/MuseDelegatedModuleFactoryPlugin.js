'use strict';

const DelegatedModule = require('webpack/lib/DelegatedModule');
const { findMuseModule } = require('@ebay/muse-modules');

/**
 * MUSE DelegatedModuleFactoryPlugin
 * (based on original webpack's DelegatedModuleFactoryPlugin here: https://github.com/webpack/webpack/blob/main/lib/DelegatedModuleFactoryPlugin.js)
 */
class MuseDelegatedModuleFactoryPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(normalModuleFactory) {
    normalModuleFactory.hooks.module.tap('MuseDelegatedModuleFactoryPlugin', module => {
      const mergedContent = this.options.mergedContent;

      // if this plugin defines a "customLibs" section on the museConfig,
      // we have to exclude those libs from the DelegatedModule definition (return the module directly)
      const customLibs = this.options.museConfig?.customLibs || [];
      for (const customLib of customLibs) {
        for (const keyToRemove of Object.keys(mergedContent).filter(key => {
          const regex = new RegExp(`^${customLib}@`);
          return regex.test(key);
        })) {
          delete mergedContent[keyToRemove];
        }
      }

      const rrd = module.resourceResolveData;
      const dfd = rrd?.descriptionFileData;
      if (!dfd || !dfd.name || !dfd.version) {
        return module;
      }

      const request = module.libIdent(this.options);
      const relPath = rrd?.relativePath?.replace('./', '');
      const museModuleId = `${dfd.name}@${dfd.version}/${relPath}`;
      const closestSemanticModule = findMuseModule(museModuleId, {
        modules: mergedContent,
      });
      if (closestSemanticModule) {
        // we build a reference to the module as a DelegatedModule, using the closest semantic module found
        return new DelegatedModule(
          this.options.source,
          closestSemanticModule,
          this.options.type,
          request,
          module,
          museModuleId,
        );
      }
      return module;
    });
  }
}
module.exports = MuseDelegatedModuleFactoryPlugin;
