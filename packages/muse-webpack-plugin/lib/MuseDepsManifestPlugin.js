
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

/**
 * This plugin generates a deps-manifest.json under the /build(dev/dist) folder of a MUSE plugin.
 * The file describes which Delegated Modules (generated on the MuseDelegatedModuleFactoryPlugin) are coming from a MUSE library plugin.
 * Example: "@ebay/muse-react@1.0.0": ["@ebay/muse-react@1.0.0/src/common/store.js", "react@18.1.0/index.js"]
 * 
 * This file can be used to check if any dependencies from library plugins are missing when deploying the plugin on an appication. 
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

        // emit hook happens right before webpack is going to write the output files.
        // at this moment, we already have all the compiled modules on the compilation.modules Array.
        compiler.hooks.emit.tapAsync('MuseDepsManifestPlugin', (compilation, callback) => {

            const depsContent = {};
            // we only need the DelegatedModules generated from the MuseDelegatedModuleFactoryPlugin
            const delegatedModules = Array.from(compilation.modules).filter((m) => m.sourceRequest === 'muse-shared-modules');
            const libsManifests = this.options.libsManifestContent; // lib-manifest.json contents of each library plugin

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


            // write all the dependencies into a file (deps-manifest.json)
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
