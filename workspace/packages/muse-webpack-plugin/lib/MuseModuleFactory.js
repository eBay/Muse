'use strict';

const MuseModule = require('./MuseModule');
const ModuleFactory = require('webpack/lib/ModuleFactory');

/** @typedef {import("./ModuleFactory").ModuleFactoryCreateData} ModuleFactoryCreateData */
/** @typedef {import("./ModuleFactory").ModuleFactoryResult} ModuleFactoryResult */

class MuseModuleFactory extends ModuleFactory {
  constructor() {
    super();
    this.hooks = Object.freeze({});
  }
  /**
   * @param {ModuleFactoryCreateData} data data object
   * @param {function(Error=, ModuleFactoryResult=): void} callback callback
   * @returns {void}
   */
  create(data, callback) {
    const dependency = data.dependencies[0];
    callback(null, {
      module: new MuseModule(data.context, dependency.dependencies, dependency.name),
    });
  }
}

module.exports = MuseModuleFactory;
