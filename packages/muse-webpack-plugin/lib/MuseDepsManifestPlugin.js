/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/

'use strict';

const resolveCwd = require('resolve-cwd');
const { dirname, mkdirp } = require('webpack/lib/util/fs');
const path = require('path');

/** @typedef {import("./Compiler")} Compiler */

/**
 * @typedef {Object} ManifestModuleData
 * @property {string | number} id
 * @property {Object} buildMeta
 * @property {boolean | string[]} exports
 */

class MuseDepsManifestPlugin {
    constructor(options) {
        this.options = { ...options };
    }

    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler) {
        compiler.hooks.emit.tapAsync('MuseDepsManifestPlugin', (compilation, callback) => {

            const depsContent = {};
            const libsManifestContent = {};
            const delegatedModules = Array.from(compilation.modules).filter((m) => m.sourceRequest === 'muse-shared-modules');

            if ('museLibs' in this.options) {
                for (const refMuseLib of this.options.museLibs) {
                    const currentMuseLibManifestContent = require(resolveCwd(`${refMuseLib.name}/build/${this.options.isDevBuild ? 'dev' : 'dist'}/lib-manifest.json`)).content;
                    libsManifestContent[`${refMuseLib.name}`] = {
                        version: refMuseLib.version,
                        content: currentMuseLibManifestContent,
                    };
                }
            
                for (const delegateModule of delegatedModules) {
                    const delegateModuleRequest = delegateModule.request;
                    // check which shared muse libs use this request
                    for (const lib of this.options.museLibs) {
                        if (Object.keys(libsManifestContent[lib.name].content).includes(delegateModuleRequest)) {
                            depsContent[`${lib.name}@${lib.version}`] ?
                                depsContent[`${lib.name}@${lib.version}`].push(delegateModuleRequest) :
                                depsContent[`${lib.name}@${lib.version}`] = [delegateModuleRequest];
                        }
                    }
                }
            }

            const targetPath = compilation.getPath(path.join(process.cwd(), `build/${this.options.isDevBuild ? 'dev' : 'dist'}/deps-manifest.json`));
            const manifest = {
                content: depsContent,
            };

            const manifestContent = JSON.stringify(manifest, null, 2);
            const buffer = Buffer.from(manifestContent, 'utf8');

            mkdirp(
                compiler.intermediateFileSystem,
                dirname(compiler.intermediateFileSystem, targetPath),
                (err) => {
                    if (err) return callback(err);
                    compiler.intermediateFileSystem.writeFile(targetPath, buffer, callback);
                },
            );

        });
    }
}
module.exports = MuseDepsManifestPlugin;
