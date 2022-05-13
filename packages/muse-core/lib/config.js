const jsYaml = require('js-yaml');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

let config = {};

// Find muse config file by locations:
//   1. cwd
//   2. homedir
const configFile = [process.cwd(), os.homedir()]
  .map((d) => path.join(d, 'muse.config.yaml'))
  .find((f) => fs.existsSync(f));

if (configFile) {
  const configObj = jsYaml.load(fs.readFileSync(configFile));
  if (configObj.provider) config = require(configObj.provider);
  else config = configObj;
}
module.exports = config;
