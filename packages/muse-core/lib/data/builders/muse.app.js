const _ = require('lodash');
const { getApp } = require('../../am');
const { getDeployedPlugins } = require('../../pm');
const logger = require('../../logger').createLogger('muse.data.builder.muse-app');

module.exports = {
  // check if a key can be built from this builder
  match: key => {
    const arr = key.split('.');
    return arr.length === 3 && arr[0] === 'muse' && arr[1] === 'app';
  },
  get: async key => {
    const appName = key.split('.')[2];
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
    logger.verbose(`Getting Muse data keys ...`);
    return _.chain(keys)
      .map(key => {
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
