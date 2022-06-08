/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/

'use strict';

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
            const delegatedModules = Array.from(compilation.modules).filter((m) => m.sourceRequest === 'muse-shared-modules');
            const libsManifests = this.options.libsManifestContent;

            for (const delegateModule of delegatedModules) {
                const delegateModuleRequest = delegateModule.request;
                // check which shared muse libs use this request
                for (const lib of Object.keys(libsManifests)) {
                    if (Object.keys(libsManifests[lib].content).includes(delegateModuleRequest)) {
                        // this module request is referenced / used by the muse "lib" library
                        const museLibRef = `${lib}@${libsManifests[lib].version}`;
                        depsContent[museLibRef] ?
                            depsContent[museLibRef].push(delegateModuleRequest) :
                            depsContent[museLibRef] = [delegateModuleRequest];
                    }
                }
            }


            const targetPath = compilation.getPath(path.join(process.cwd(),
                `build/${this.options.isDevBuild ? 'dev' : 'dist'}/deps-manifest.json`));

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
