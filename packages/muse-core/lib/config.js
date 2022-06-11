const fs = require('fs-extra');
const _ = require('lodash');
const { cosmiconfigSync } = require('cosmiconfig');

const explorerSync = cosmiconfigSync('muse', {
  searchPlaces: [
    '.muserc',
    '.muserc.json',
    '.muserc.yaml',
    'muse.config.yaml',
    'muse.config.js',
    'muse.config.cjs',
    'muse.config.json',
  ],
});

const envConfigFile = process.env.MUSE_CONFIG_FILE;

let cosmicResult;
if (envConfigFile) {
  if (!fs.existsSync(envConfigFile)) {
    // If the config file is by env.MUSE_CONFIG_FILE but it doesn't exist, throw the error.
    throw new Error(
      `Muse config file specified by MUSE_CONFIG_FILE doesn't exist: ${envConfigFile}.`,
    );
  }
  cosmicResult = explorerSync.load(envConfigFile);
} else {
  cosmicResult = explorerSync.search();
}

if (cosmicResult) {
  // console.log(`Loaded Muse config from: ${cosmicResult.filepath}.`);
}

const config = cosmicResult?.config || {};
config.get = (prop) => _.get(config, prop);
module.exports = config;
