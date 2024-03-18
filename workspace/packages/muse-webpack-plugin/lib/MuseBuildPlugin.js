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
    compiler.hooks.done.tap('MuseBuildPlugin', () => {
      const buildPath = process.env.BUILD_PATH;

      // Copy /src/ext-points.d.ts to ${buildPath}/ext-points.d.ts
      const sourcePath = path.resolve(compiler.context, 'src/ext-points.d.ts');
      const targetPath = path.resolve(buildPath, 'ext-points.d.ts');
      fs.copySync(sourcePath, targetPath);
    });
  }
}

module.exports = MuseBuildPlugin;
