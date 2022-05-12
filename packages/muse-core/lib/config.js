const jsYaml = require('js-yaml');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

let config = null;
module.exports = () => {
  if (config) return config;

  // find muse config file by locations:
  //   1. cwd
  //   2. homedir

  const configFile = [process.cwd(), os.homedir()]
    .map((d) => path.join(d, 'muse.config.yaml'))
    .find((f) => fs.existsSync(f));

  if (!configFile) config = {};
  else {
    const configObj = jsYaml.load(fs.readFileSync(configFile));
    if (configObj.provider) config = require(configObj.provider);
    else config = configObj;
  }
  return config;
};
