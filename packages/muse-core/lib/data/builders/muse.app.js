const { getApp } = require('../../am');
const { getPlugins, getDeployedPlugins } = require('../../pm');

module.exports = {
  key: 'muse.app.:appName',
  get: async ({ appName }) => {
    const app = await getApp(appName);
    if (!app) throw new Error(`App ${appName} doesn't exist.`);

    await Promise.all(
      Object.values(app.envs || {}).map(async (env) => {
        const deployedPlugins = await getDeployedPlugins(appName, env.name);
        env.plugins = deployedPlugins;
      }),
    );
    return app;
  },
};
