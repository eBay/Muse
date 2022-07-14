// This is the only entry point for muse-core
// Never require a module by module path
var Module = require('module');
var originalRequire = Module.prototype.require;

let __museCoreSingleton = null;
// Ensure @ebay/muse-core only has one instance
Module.prototype.require = function() {
  const name = arguments[0];
  if (name === '@ebay/muse-core' && __museCoreSingleton) return __museCoreSingleton;
  const m = originalRequire.apply(this, arguments);
  if (name === '@ebay/muse-core') __museCoreSingleton = m;
  return m;
};

const fs = require('fs');
const os = require('os');
const path = require('path');
const plugin = require('js-plugin');

const envFile1 = path.join(process.cwd(), '.muse.env');
const envFile2 = path.join(os.homedir(), '.muse.env');

[envFile1, envFile2].some(envFile => {
  if (fs.existsSync(envFile)) {
    require('dotenv').config({ path: envFile });
    return true;
  }
});

const config = require('./config');

module.exports.config = config;
module.exports.logger = require('./logger');
module.exports.registerPlugin = p => {
  if (config.__pluginLoaded) {
    throw new Error(
      `You can only register a plugin before initialization. Usually you should register a plugin in the global scope in your code.`,
    );
  }
  plugin.register(p);
};

global.MUSE_CORE = module.exports;

require('./initPlugins');

module.exports.am = require('./am');
module.exports.pm = require('./pm');
module.exports.req = require('./req');
module.exports.data = require('./data');
module.exports.storage = require('./storage');
module.exports.utils = require('./utils');
module.exports.plugin = plugin;

// plugins that implement this endpoint can extend muse object itself !!
plugin.invoke('museCore.processMuse', module.exports);
