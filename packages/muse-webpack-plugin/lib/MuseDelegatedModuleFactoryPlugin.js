'use strict';

const DelegatedModule = require('webpack/lib/DelegatedModule');
const { findMuseModule } = require('muse-modules');

class MuseDelegatedModuleFactoryPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(normalModuleFactory) {
    normalModuleFactory.hooks.module.tap('MuseDelegatedModuleFactoryPlugin', (module) => {
      const rrd = module.resourceResolveData;
      const dfd = rrd?.descriptionFileData;
      if (!dfd || !dfd.name || !dfd.version) {
        return module;
      }

      const request = module.libIdent(this.options);
      const relPath = rrd?.relativePath?.replace('./', '');
      const museModuleId = `${dfd.name}@${dfd.version}/${relPath}`;
      const closestSemanticModule = findMuseModule(museModuleId, { modules: this.options.mergedContent });
      if (closestSemanticModule) {
        return new DelegatedModule(this.options.source, closestSemanticModule, this.options.type, request, module, museModuleId);
      }
      return module;
    });
  }
}
module.exports = MuseDelegatedModuleFactoryPlugin;
