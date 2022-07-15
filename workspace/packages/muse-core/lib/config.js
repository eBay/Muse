const fs = require('fs-extra');
const _ = require('lodash');
const { cosmiconfigSync } = require('cosmiconfig');
const os = require('os');

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
  if (!cosmicResult) {
    cosmicResult = explorerSync.search(os.homedir());
  }
}

if (cosmicResult) {
  // console.log(`Loaded Muse config from: ${cosmicResult.filepath}.`);
}

let config = cosmicResult?.config || {};
if (_.isFunction(config)) {
  config = config();
}
// process.exit();
if (config.extend) {
  let baseConfig = require(config.extend);
  if (_.isFunction(baseConfig)) baseConfig = baseConfig();
  Object.assign(baseConfig, _.omit(config, ['extend', 'plugins', 'presets']));
  if (!baseConfig.plugins) baseConfig.plugins = [];
  if (!baseConfig.presets) baseConfig.presets = [];
  baseConfig.plugins.concat(..._(config.plugins || []));
  baseConfig.presets.concat(..._(config.presets || []));
  config = baseConfig;
}

// parse $env.ENV_VAR to the real value from process.env.ENV_VAR
const parsePropEnvs = obj => {
  // While using Object.keys it includes array
  Object.keys(obj).forEach(p => {
    const v = obj[p];
    if (_.isObject(v) || _.isArray(v)) parsePropEnvs(v);
    else if (_.isString(v)) {
      if (v.startsWith('$env.')) {
        obj[p] = process.env[v.replace('$env.', '')];
      }
    }
  });
};

parsePropEnvs(config);

config.get = prop => _.get(config, prop);
config.filepath = cosmicResult?.filepath;
module.exports = config;
