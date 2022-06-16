// This is the only entry point for muse-core
// Never require a module by module path

const fs = require('fs');
const os = require('os');
const path = require('path');

const envFile1 = path.join(process.cwd(), '.muse.env');
const envFile2 = path.join(os.homedir(), '.muse.env');

[envFile1, envFile2].some((envFile) => {
  if (fs.existsSync(envFile)) {
    require('dotenv').config({ path: envFile });
    return true;
  }
});

const muse = {};
require('./initPlugins');
module.exports = muse;

Object.assign(muse, {
  am: require('./am'),
  pm: require('./pm'),
  req: require('./req'),
  data: require('./data'),
  config: require('./config'),
  storage: require('./storage'),
  utils: require('./utils'),
  logger: require('./logger'),
});
