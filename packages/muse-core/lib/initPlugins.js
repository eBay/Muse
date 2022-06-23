/**
 * IMPORTANT: muse-core must be initialized before using any APIs.
 * It loads all plugins defined in Muse config.
 * */

const _ = require('lodash');
const path = require('path');
const plugin = require('js-plugin');
const importFrom = require('import-from');
const config = require('./config');
const {
  assetsFileStoragePlugin,
  registryFileStoragePlugin,
  assetsLruCachePlugin,
  dataCachePlugin,
  ...restPlugins
} = require('./plugins');

const configDir = config.filepath ? path.dirname(config.filepath) : process.cwd();

const loadPlugin = (pluginDef) => {
  let pluginInstance = null;
  let pluginOptions = null;
  if (_.isString(pluginDef)) {
    pluginInstance = importFrom(configDir, pluginDef);
  } else if (_.isArray(pluginDef)) {
    pluginInstance = importFrom(configDir, pluginDef[0]);
    pluginOptions = pluginDef[1];
  } else if (_.isObject(pluginDef)) {
    pluginInstance = pluginDef;
  } else {
    throw new Error(`Unknown plugin definition: ${String(pluginDef)}`);
  }
  if (_.isFunction(pluginInstance)) pluginInstance = pluginInstance(pluginOptions);
  plugin.register(pluginInstance);
};

config.plugins?.forEach(loadPlugin);
_.castArray(config.presets)
  .filter(Boolean)
  .forEach((preset) => {
    let plugins = importFrom(configDir, preset);
    if (_.isFunction(plugins)) plugins = plugins();
    plugins.forEach(loadPlugin);
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

if (config.get('defaultDataCachePlugin')) {
  plugin.register(dataCachePlugin());
}

Object.values(restPlugins).forEach((p) => plugin.register(p()));

// When all plugins are loaded, invoke onReady on each plugin
plugin.invoke('onReady', config);
config.__pluginLoaded = true;
