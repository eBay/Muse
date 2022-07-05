const { getApp } = require('../../am');
const { getPlugins, getDeployedPlugins } = require('../../pm');
const logger = require('../../logger').createLogger('muse.data.builder.muse-app');

module.exports = {
  name: 'muse.app',
  key: 'muse.app.:appName',
  get: async ({ appName }) => {
    logger.verbose(`Getting muse.data.${appName}...`);
    const app = await getApp(appName);
    if (!app) throw new Error(`App ${appName} doesn't exist.`);

    await Promise.all(
      Object.values(app.envs || {}).map(async env => {
        const deployedPlugins = await getDeployedPlugins(appName, env.name);
        env.plugins = deployedPlugins;
      }),
    );
    logger.verbose(`Succeeded to get muse.data.${appName}.`);
    return app;
  },
  getMuseDataKeysByRawKeys: async (rawDataType, keys) => {
    if (rawDataType !== 'registry') return null;
    keys.forEach(key => {
      //
    });
  },
};
