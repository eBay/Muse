const fs = require('fs');
const os = require('os');
const path = require('path');

const envFile1 = path.join(process.cwd(), '.env.muse');
const envFile2 = path.join(os.homedir(), '.env.muse');

[envFile1, envFile2].some((envFile) => {
  if (fs.existsSync(envFile)) {
    require('dotenv').config({ path: envFile });
    return true;
  }
});

module.exports = {
  am: require('./am'),
  pm: require('./pm'),
  req: require('./req'),
  data: require('./data'),
  config: require('./config'),
  storage: require('./storage'),
  utils: require('./utils'),
};
require('./initPlugins');
