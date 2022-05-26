'use strict';

// const DelegatedModule = require('webpack/lib/DelegatedModule');
const DelegatedModule = require('webpack/lib/DelegatedModule');
// const MuseDelegatedModule = require('./MuseDelegatedModule');
const findMuseModule = require('./findMuseModule');

// options.source
// options.content
// options.type
// options.noShare : which modules don't use shared
class MuseDelegatedModuleFactoryPlugin {
  constructor(options) {
    this.options = options;
    // console.log(this.options);
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
      const found = findMuseModule(museModuleId, this.options.content);
      if (found) {
        return new DelegatedModule(this.options.source, found, this.options.type, request, module, museModuleId);
      }
      return module;
    });
  }
}
module.exports = MuseDelegatedModuleFactoryPlugin;
