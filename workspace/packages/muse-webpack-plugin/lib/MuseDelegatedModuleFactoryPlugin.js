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
      const customLibs = this.options.museConfig?.customLibs || [];
      const rrd = module.resourceResolveData;
      const dfd = rrd?.descriptionFileData;
      if (
        !dfd ||
        !dfd.name ||
        !dfd.version ||
        (dfd.name && customLibs.some(cl => cl === dfd.name))
      ) {
        return module;
      }

      const request = module.libIdent(this.options);
      const relPath = rrd?.relativePath?.replace('./', '');
      const museModuleId = `${dfd.name}@${dfd.version}/${relPath}`;
      const closestSemanticModule = findMuseModule(museModuleId, {
        modules: this.options.mergedContent,
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
