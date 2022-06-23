// This is the only entry point for muse-core
// Never require a module by module path

const fs = require('fs');
const os = require('os');
const path = require('path');
const plugin = require('js-plugin');

const envFile1 = path.join(process.cwd(), '.muse.env');
const envFile2 = path.join(os.homedir(), '.muse.env');

[envFile1, envFile2].some((envFile) => {
  if (fs.existsSync(envFile)) {
    require('dotenv').config({ path: envFile });
    return true;
  }
});

const config = require('./config');
const muse = {
  config,
  logger: require('./logger'),
  // register plugin must be called in the global scope
  registerPlugin: (p) => {
    if (config.__pluginLoaded) {
      throw new Error(
        `You can only register a plugin before initialization. Usually you should register a plugin in the global scope in your code.`,
      );
    }
    plugin.register(p);
  },
};
module.exports = muse;

require('./initPlugins');

Object.assign(muse, {
  am: require('./am'),
  pm: require('./pm'),
  req: require('./req'),
  data: require('./data'),
  // config: require('./config'),
  storage: require('./storage'),
  utils: require('./utils'),
  // logger: require('./logger'),
});

// plugins that implement this endpoint can extend muse object itself !!
plugin.invoke('museCore.processMuse', muse);
