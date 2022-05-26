'use strict';

const path = require('path');
const { RawSource } = require('webpack-sources');
const Module = require('webpack/lib/Module');
const RuntimeGlobals = require('webpack/lib/RuntimeGlobals');
const makeSerializable = require('webpack/lib/util/makeSerializable');

/** This is the loader module of Muse to load other modules. */
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../declarations/WebpackOptions").WebpackOptionsNormalized} WebpackOptions */
/** @typedef {import("./ChunkGraph")} ChunkGraph */
/** @typedef {import("./Compilation")} Compilation */
/** @typedef {import("./Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("./DependencyTemplates")} DependencyTemplates */
/** @typedef {import("./Module").CodeGenerationContext} CodeGenerationContext */
/** @typedef {import("./Module").CodeGenerationResult} CodeGenerationResult */
/** @typedef {import("./Module").NeedBuildContext} NeedBuildContext */
/** @typedef {import("./Module").SourceContext} SourceContext */
/** @typedef {import("./RequestShortener")} RequestShortener */
/** @typedef {import("./ResolverFactory").ResolverWithOptions} ResolverWithOptions */
/** @typedef {import("./RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("./WebpackError")} WebpackError */
/** @typedef {import("./util/Hash")} Hash */
/** @typedef {import("./util/fs").InputFileSystem} InputFileSystem */

const TYPES = new Set(['javascript']);
const RUNTIME_REQUIREMENTS = new Set([RuntimeGlobals.require, RuntimeGlobals.global, RuntimeGlobals.module]);

class MuseModule extends Module {
  constructor(context, dependencies, name) {
    super('javascript/dynamic', context);

    // Info from Factory
    this.dependencies = dependencies;
    this.name = name;
  }

  /**
   * @returns {Set<string>} types available (do not mutate)
   */
  getSourceTypes() {
    return TYPES;
  }

  /**
   * @returns {string} a unique identifier of the module
   */
  identifier() {
    return `muse ${this.name}`;
  }

  /**
   * @param {RequestShortener} requestShortener the request shortener
   * @returns {string} a user readable identifier of the module
   */
  readableIdentifier(requestShortener) {
    return `muse ${this.name}`;
  }

  /**
   * @param {WebpackOptions} options webpack options
   * @param {Compilation} compilation the compilation
   * @param {ResolverWithOptions} resolver the resolver
   * @param {InputFileSystem} fs the file system
   * @param {function(WebpackError=): void} callback callback function
   * @returns {void}
   */
  build(options, compilation, resolver, fs, callback) {
    this.buildMeta = {};
    this.buildInfo = {};
    return callback();
  }

  /**
   * @param {CodeGenerationContext} context context for code generation
   * @returns {CodeGenerationResult} result
   */
  codeGeneration(context) {
    //     const fs = context.runtimeTemplate.compilation.inputFileSystem;
    //     const srcFindMuseModule = fs
    //       .readFileSync(path.join(__dirname, './findMuseModule.js'))
    //       .toString('utf-8')
    //       .replace(
    //         'module.exports = findMuseModule;',
    //         `var __muse_module_cache__ = {};
    // module.exports = (moduleId) => {
    //   // Check if module is in cache
    //   var cachedModule = __muse_module_cache__[moduleId];
    //   if (!cachedModule) {
    //     museModule = cachedModule;
    //     __muse_module_cache__[moduleId] = findMuseModule(moduleId)
    //   }

    //   // Use module's require method to get the final module
    //   const m = __muse_module_cache__[moduleId];
    //   if (!m) throw new Error('Muse module not found: ' + moduleId);
    //   return m.__webpack_require__(m.id);
    // };`,
    //       )
    //       .replace('__webpack_require_global__', RuntimeGlobals.global);
    const sources = new Map();
    sources.set('javascript', new RawSource(''));
    return {
      sources,
      runtimeRequirements: RUNTIME_REQUIREMENTS,
    };
  }

  /**
   * @param {NeedBuildContext} context context info
   * @param {function(WebpackError=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
   * @returns {void}
   */
  needBuild(context, callback) {
    return callback(null, !this.buildMeta);
  }

  /**
   * @param {string=} type the source type for which the size should be estimated
   * @returns {number} the estimated size of the module (must be non-zero)
   */
  size(type) {
    return 12;
  }

  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash, context) {
    hash.update(`muse module${this.name || ''}`);
    super.updateHash(hash, context);
  }

  serialize(context) {
    context.write(this.name);
    super.serialize(context);
  }

  deserialize(context) {
    this.name = context.read();
    super.deserialize(context);
  }

  /**
   * Assuming this module is in the cache. Update the (cached) module with
   * the fresh module from the factory. Usually updates internal references
   * and properties.
   * @param {Module} module fresh module
   * @returns {void}
   */
  updateCacheModule(module) {
    super.updateCacheModule(module);
    this.dependencies = module.dependencies;
  }

  /**
   * Assuming this module is in the cache. Remove internal references to allow freeing some memory.
   */
  cleanupForCache() {
    super.cleanupForCache();
    this.dependencies = undefined;
  }
}

makeSerializable(MuseModule, 'webpack/lib/MuseModule');

module.exports = MuseModule;
