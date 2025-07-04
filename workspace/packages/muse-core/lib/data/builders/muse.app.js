const _ = require('lodash');
const getApp = require('../../am/getApp');
const getDeployedPlugins = require('../../pm/getDeployedPlugins');
const getPlugin = require('../../pm/getPlugin');
const logger = require('../../logger').createLogger('muse.data.builder.muse-app');

module.exports = {
  // check if a key can be built from this builder
  match: (key) => {
    const arr = key.split('.');
    return arr.length === 3 && arr[0] === 'muse' && arr[1] === 'app';
  },
  get: async (key) => {
    const appName = key.split('.')[2];
    logger.verbose(`Getting muse.data.${appName}...`);
    const app = await getApp(appName);
    if (!app) return null; // throw new Error(`App ${appName} doesn't exist.`);

    const allPlugins = {};
    await Promise.all(
      Object.values(app.envs || {}).map(async (env) => {
        const deployedPlugins = await getDeployedPlugins(appName, env.name);
        env.plugins = deployedPlugins;
        env.plugins.forEach((plugin) => {
          allPlugins[plugin.name] = true;
        });
      }),
    );

    // Get all common plugin variables
    const pluginVariablesByName = {};
    await Promise.all(
      Object.keys(allPlugins).map(async (pluginName) => {
        const pluginMeta = await getPlugin(pluginName);
        if (pluginMeta?.variables) {
          pluginVariablesByName[pluginName] = pluginMeta.variables;
        }
      }),
    );

    // Assign plugin variables to each deployed plugin
    Object.values(app.envs || {}).map((env) => {
      env.plugins.forEach((plugin) => {
        if (pluginVariablesByName[plugin.name]) {
          plugin.variables = pluginVariablesByName[plugin.name];
        }
      });
    });
    logger.verbose(`Succeeded to get muse.data.${appName}.`);
    return app;
  },
  getMuseDataKeysByRawKeys: (rawDataType, keys) => {
    if (rawDataType !== 'registry') return null;
    logger.verbose(`Getting Muse data keys ...`);
    return _.chain(keys)
      .map((key) => {
        const arr = key.split('/').filter(Boolean);
        if (arr[0] === 'apps' && arr[1]) return `muse.app.${arr[1]}`;
        return null;
      })
      .filter(Boolean)
      .flatten()
      .uniq()
      .value();
  },
};
