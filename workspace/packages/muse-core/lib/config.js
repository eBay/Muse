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
  // Only load config from the cwd by default
  stopDir: process.cwd(),
});

const envConfigFile = process.env.MUSE_CONFIG_FILE;

let cosmicResult;
if (envConfigFile) {
  envConfigFile
    .split(';')
    .filter(Boolean)
    .map(_.trim)
    .some((f) => {
      if (fs.existsSync(envConfigFile)) {
        cosmicResult = explorerSync.load(f);
        return true;
      }
    });
} else {
  cosmicResult = explorerSync.search();
}

let config = cosmicResult?.config || {};
if (_.isFunction(config)) {
  config = config();
}

if (config.extends) {
  let baseConfig = require(config.extends);
  if (_.isFunction(baseConfig)) baseConfig = baseConfig();
  Object.assign(baseConfig, _.omit(config, ['extends', 'plugins', 'presets']));
  if (!baseConfig.plugins) baseConfig.plugins = [];
  if (!baseConfig.presets) baseConfig.presets = [];
  baseConfig.plugins.push(...(config.plugins || []));
  baseConfig.presets.push(...(config.presets || []));
  config = baseConfig;
}

// parse $env.ENV_VAR to the real value from process.env.ENV_VAR
const parsePropEnvs = (obj) => {
  // While using Object.keys it includes array
  Object.keys(obj).forEach((p) => {
    const v = obj[p];
    if ((_.isObject(v) || _.isArray(v)) && !_.isFunction(v)) parsePropEnvs(v);
    else if (_.isString(v)) {
      if (v.startsWith('$env.')) {
        obj[p] = process.env[v.replace('$env.', '')];
      }
    }
  });
};

parsePropEnvs(config);

config.get = (prop) => _.get(config, prop);
config.filepath = cosmicResult?.filepath;
module.exports = config;
