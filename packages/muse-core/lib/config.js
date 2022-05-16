const os = require('os');
const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const jsYaml = require('js-yaml');

let config = {};

// Find muse config file by locations:
//   1. cwd
//   2. homedir

let configFile;
const envConfigFile = process.env.MUSE_CONFIG_FILE;
if (envConfigFile && path.isAbsolute(envConfigFile)) {
  configFile = envConfigFile;
} else {
  configFile = [process.cwd(), os.homedir()]
    .map((d) => path.join(d, envConfigFile || 'muse.config.yaml'))
    .find((f) => fs.existsSync(f));
}

if (configFile) {
  const configObj = jsYaml.load(fs.readFileSync(configFile));
  if (configObj.provider) config = require(configObj.provider);
  else config = configObj;
}

config.get = (prop) => _.get(config, prop);
module.exports = config;
