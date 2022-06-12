/**
 * IMPORTANT: muse-core must be initialized before using any APIs.
 * It loads all plugins defined in Muse config.
 * */

const _ = require('lodash');
const plugin = require('js-plugin');
const config = require('./config');
const {
  assetsFileStoragePlugin,
  registryFileStoragePlugin,
  assetsLruCachePlugin,
} = require('./plugins');

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

// Built-in behavior initialization
// If no assets storage plugin, then use the default one
const assetsStorageProviders = plugin.getPlugins('museCore.assets.storage.get').filter(Boolean);
if (assetsStorageProviders.length > 1) {
  console.log(
    `[WARNING]: multiple assets stroage providers found: ${assetsStorageProviders
      .map((p) => p.name)
      .join(', ')}. Only the first one is used: ${assetsStorageProviders[0].name}.`,
  );
}
if (assetsStorageProviders.length === 0) {
  plugin.register(assetsFileStoragePlugin());
}

// If no registry storage plugin, then use the default one
const registryStorageProviders = plugin.getPlugins('museCore.registry.storage.get').filter(Boolean);
if (registryStorageProviders.length > 1) {
  console.log(
    `[WARNING]: multiple registry stroage providers found: ${registryStorageProviders
      .map((p) => p.name)
      .join(', ')}. Only the first one is used: ${registryStorageProviders[0].name}.`,
  );
}
if (registryStorageProviders.length === 0) {
  plugin.register(registryFileStoragePlugin());
}

if (config.get('assetStorageCache') !== false) {
  plugin.register(assetsLruCachePlugin());
}

// When all plugins are loaded, invoke onReady on each plugin
plugin.invoke('onReady', config);
