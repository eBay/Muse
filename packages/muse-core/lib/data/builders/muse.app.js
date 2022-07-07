const _ = require('lodash');
const { getApp } = require('../../am');
const { getDeployedPlugins } = require('../../pm');
const logger = require('../../logger').createLogger('muse.data.builder.muse-app');

module.exports = {
  name: 'muse.app',
  key: 'muse.app.:appName',
  get: async ({ appName }) => {
    logger.verbose(`Getting muse.data.${appName}...`);
    const app = await getApp(appName);
    if (!app) return null; // throw new Error(`App ${appName} doesn't exist.`);

    await Promise.all(
      Object.values(app.envs || {}).map(async env => {
        const deployedPlugins = await getDeployedPlugins(appName, env.name);
        env.plugins = deployedPlugins;
      }),
    );
    logger.verbose(`Succeeded to get muse.data.${appName}.`);
    return app;
  },
  getMuseDataKeysByRawKeys: (rawDataType, keys) => {
    if (rawDataType !== 'registry') return null;
    logger.verbose(`Getting Muse data keys by ${keys}...`);
    return _.chain(keys)
      .map(key => {
        const arr = key.split('/').filter(Boolean);
        if (arr[0] === 'apps' && arr[1]) return `muse.app.${arr[1]}`;
        // TODO: when deployed plugins have been changed, also need to update cache.
        return null;
      })
      .filter(Boolean)
      .flatten()
      .uniq()
      .value();
  },
};
