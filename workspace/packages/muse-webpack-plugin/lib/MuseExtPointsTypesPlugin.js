'use strict';
const fs = require('fs');
const path = require('path');
const DtsBundlePlugin = require('dts-bundle-webpack');
/**
 * This plugin is used to bundle the ext-points.d.ts file into a single file and output it to the build path.
 */
class MuseExtPointsTypesPlugin {
  constructor(context, entries, options) {
    this.context = context;
    this.entries = entries;
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('MuseExtPointsTypesPlugin', () => {
      const buildPath = process.env.BUILD_PATH;

      // Copy /src/ext-points.d.ts to ${buildPath}/ext-points.d.ts
      const sourcePath = path.resolve(compiler.context, 'src/ext-points.d.ts');
      // Check if the file ext-points.d.ts exists
      if (!fs.existsSync(sourcePath)) {
        console.info('\nNo ext-points.d.ts found in src.\n');
        return;
      }
      const targetPath = path.resolve(buildPath, 'ext-points.d.ts');
      const pkgName = require(path.resolve(compiler.context, 'package.json')).name;

      new DtsBundlePlugin({
        name: pkgName,
        main: sourcePath,
        out: targetPath,
        outputAsModuleFolder: true,
      }).apply(compiler);
    });
  }
}

module.exports = MuseExtPointsTypesPlugin;
