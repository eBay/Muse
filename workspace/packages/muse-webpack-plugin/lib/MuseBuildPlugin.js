'use strict';
const fs = require('fs-extra');
const path = require('path');

/**
 * This plugin will generate a info.json under output folder, recording the buildTime property against the building env.
 */
class MuseBuildPlugin {
  constructor(context, entries, options) {
    this.context = context;
    this.entries = entries;
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.done.tap('MuseBuildPlugin', (stats) => {
      const buildPath = process.env.BUILD_PATH;
      const buildTime = stats.endTime - stats.startTime;
      const infoJsonFilePath = path.join(buildPath, 'info.json');
      fs.removeSync(infoJsonFilePath);
      fs.ensureFileSync(infoJsonFilePath);
      const info = {
        buildTime,
      };
      fs.writeFileSync(infoJsonFilePath, JSON.stringify(info, null, 2));
    });
  }
}

module.exports = MuseBuildPlugin;
