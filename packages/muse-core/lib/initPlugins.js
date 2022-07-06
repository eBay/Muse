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
  environmentVariablesPlugin,
  ...restPlugins
} = require('./plugins');

const configDir = config.filepath ? path.dirname(config.filepath) : process.cwd();

const loadPlugin = pluginDef => {
  let pluginInstance = null;
  let pluginOptions = null;
  if (_.isString(pluginDef)) {
    pluginInstance = importFrom(configDir, pluginDef);
  } else if (_.isArray(pluginDef)) {
    const p = pluginDef[0];
    if (_.isString(p)) {
      pluginInstance = importFrom(configDir, p);
    } else if (_.isObject(p) || _.isFunction(p)) {
      // else it should be string or function or object
      pluginInstance = p;
    } else {
      throw new Error(`Unknown plugin definition: ${String(pluginDef)}`);
    }
    pluginOptions = pluginDef[1];
  } else if (_.isObject(pluginDef)) {
    pluginInstance = pluginDef;
  } else if (_.isFunction(pluginDef)) {
    pluginInstance = pluginDef();
  } else {
    throw new Error(`Unknown plugin definition: ${String(pluginDef)}`);
  }
  if (_.isFunction(pluginInstance)) pluginInstance = pluginInstance(pluginOptions || {});
  plugin.register(pluginInstance);
};

// Load presets first
// A preset module must export the structure:
// [{ name: 'plugin1', plugin: pluginModule }, { name: 'plugin2', plugin: pluginModule }]
// The name for plugin is used to pass arguments to the plugin from presets config section
_.castArray(config.presets)
  .filter(Boolean)
  .forEach(preset => {
    // preset must be a string to be able to loaded by `require`
    let plugins;
    const args = {};
    if (_.isString(preset)) {
      plugins = importFrom(configDir, preset);
    } else if (_.isArray(preset)) {
      // If preset item is an array, then the first is preset module path, the second is args for plugins
      plugins = importFrom(configDir, preset[0]);
      Object.assign(args, preset[1]);
    }

    if (_.isFunction(plugins)) plugins = plugins();
    // Here plugins has the structure:
    // [{ name: 'plugin1', plugin: pluginModule }, { name: 'plugin2', plugin: pluginModule }]
    // Need to convert it and bind to args
    plugins = plugins.map(p => [p.plugin, args[p.name] || {}]);
    plugins.forEach(loadPlugin);
  });

// Then load plugins
config.plugins?.forEach(loadPlugin);

// Built-in behavior initialization
// If no assets storage plugin, then use the default one
const assetsStorageProviders = plugin.getPlugins('museCore.assets.storage.get').filter(Boolean);
if (assetsStorageProviders.length > 1) {
  console.log(
    `[WARNING]: multiple assets stroage providers found: ${assetsStorageProviders
      .map(p => p.name)
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
      .map(p => p.name)
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

plugin.register(environmentVariablesPlugin());

Object.values(restPlugins).forEach(p => plugin.register(p()));

// When all plugins are loaded, invoke onReady on each plugin
plugin.invoke('onReady', config);
config.__pluginLoaded = true;
