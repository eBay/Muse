'use strict';

const asyncLib = require('neo-async');
const { compareModulesById } = require('webpack/lib/util/comparators');
const { dirname, mkdirp } = require('webpack/lib/util/fs');
const { parseMuseId } = require('@ebay/muse-modules');
const path = require('path');

/** @typedef {import("./Compiler")} Compiler */

/**
 * @typedef {Object} ManifestModuleData
 * @property {string | number} id
 * @property {Object} buildMeta
 * @property {boolean | string[]} exports
 */

/**
 * Based on original webpack's LibManifestPlugin here: https://github.com/webpack/webpack/blob/main/lib/LibManifestPlugin.js
 */
class MuseManifestPlugin {
  constructor(options) {
    this.options = { format: true, ...options };
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    compiler.hooks.emit.tapAsync('MuseManifestPlugin', (compilation, callback) => {
      const moduleGraph = compilation.moduleGraph;
      const sharedLibs = this.options.museConfig?.sharedLibs?.exclude || [];

      asyncLib.forEach(
        Array.from(compilation.chunks),
        (chunk, callback) => {
          if (!chunk.canBeInitial()) {
            callback();
            return;
          }
          const chunkGraph = compilation.chunkGraph;
          const targetPath = compilation.getPath(
            path.join(
              process.cwd(),
              `build/${this.options.isDevBuild ? 'dev' : 'dist'}/lib-manifest.json`,
            ),
            {
              chunk,
            },
          );
          const name =
            this.options.name &&
            compilation.getPath(this.options.name, {
              chunk,
            });
          const content = Object.create(null);
          for (const module of chunkGraph.getOrderedChunkModulesIterable(
            chunk,
            compareModulesById(chunkGraph),
          )) {
            if (!module?.buildInfo?.museData?.id) continue;

            // ////////  exclude modules from sharedLibs.exclude configuration  ///////////////////
            const moduleName = parseMuseId(module.buildInfo.museData.id).name;
            if (sharedLibs.some(cl => moduleName === cl)) continue;
            // ////////////////////////////////////////////////////////////////////////////////////

            const ident = module.libIdent({
              context: this.options.context || compiler.options.context,
              associatedObjectForCache: compiler.root,
            });
            if (ident) {
              const exportsInfo = moduleGraph.getExportsInfo(module);
              const providedExports = exportsInfo.getProvidedExports();

              const id = chunkGraph.getModuleId(module);
              const data = {
                id: chunkGraph.getModuleId(module),
                buildMeta: module.buildMeta,
                exports: Array.isArray(providedExports) ? providedExports : undefined,
              };
              content[id] = data;
            }
          }

          // write the manifest file lib-manifest.json
          const manifest = {
            name,
            type: this.options.type,
            content,
          };
          // Apply formatting to content if format flag is true;
          const manifestContent = this.options.format
            ? JSON.stringify(manifest, null, 2)
            : JSON.stringify(manifest);
          const buffer = Buffer.from(manifestContent, 'utf8');
          mkdirp(
            compiler.intermediateFileSystem,
            dirname(compiler.intermediateFileSystem, targetPath),
            err => {
              if (err) return callback(err);
              compiler.intermediateFileSystem.writeFile(targetPath, buffer, callback);
            },
          );
        },
        callback,
      );
    });
  }
}
module.exports = MuseManifestPlugin;