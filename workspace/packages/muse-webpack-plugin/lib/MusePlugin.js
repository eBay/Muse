/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

'use strict';

const FlagAllModulesAsUsedPlugin = require('webpack/lib/FlagAllModulesAsUsedPlugin');
const MuseManifestPlugin = require('./MuseManifestPlugin');
const MuseEntryPlugin = require('./MuseEntryPlugin');
const MuseModuleInfoPlugin = require('./MuseModuleInfoPlugin');
const MuseModuleIdPlugin = require('./MuseModuleIdPlugin');
const MuseExtPointsTypesPlugin = require('./MuseExtPointsTypesPlugin');

/**
 * Main entry for MUSE webpack plugin
 */
class MusePlugin {
  constructor(options) {
    this.options = {
      ...options,
      entryOnly: options.entryOnly !== false,
    };
  }

  apply(compiler) {
    compiler.hooks.entryOption.tap('MusePlugin', (context, entry) => {
      if (typeof entry !== 'function') {
        for (const name of Object.keys(entry)) {
          const options = {
            name,
            // Need to detect plugin type based on entry file position?
            isDev: this.options.isDev,
            type: this.options.type || 'normal',
            filename: entry.filename,
          };
          new MuseEntryPlugin(context, entry[name].import, options).apply(compiler);
        }
      } else {
        throw new Error("MusePlugin doesn't support dynamic entry (function) yet");
      }
      return true;
    });

    new MuseModuleInfoPlugin().apply(compiler);
    new MuseModuleIdPlugin().apply(compiler);

    if (this.options.type === 'lib') {
      new MuseManifestPlugin({ entryOnly: false, format: true, ...this.options }).apply(compiler);
    }

    new FlagAllModulesAsUsedPlugin('MusePlugin').apply(compiler);
    new MuseExtPointsTypesPlugin().apply(compiler);
  }
}

module.exports = MusePlugin;
