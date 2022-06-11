/**
 * IMPORTANT: muse-core must be initialized before using any APIs.
 * It loads all plugins defined in Muse config.
 * */

const _ = require('lodash');
const plugin = require('js-plugin');
const config = require('./config');

config.plugins?.forEach((pluginDef) => {
  let pluginInstance = null;
  let pluginOptions = null;
  if (_.isString(pluginDef)) {
    pluginInstance = require(pluginDef);
  } else if (_.isObject(pluginDef)) {
    pluginInstance = require(pluginDef.module);
    pluginOptions = pluginDef.options;
  } else {
    throw new Error(`Unknown plugin definition: ${String(pluginDef)}`);
  }
  if (_.isFunction(pluginInstance)) pluginInstance = pluginInstance(pluginOptions);
  plugin.register(pluginInstance, pluginOptions);
});
plugin.invoke('onReady');
