const { getApp } = require('../../am');
const { getPlugins, getDeployedPlugins } = require('../../pm');
module.exports = async ({ appName }) => {
  const app = await getApp(appName);
  if (!app) throw new Error(`App ${appName} doesn't exist.`);

  const plugins = await getPlugins();
  await Promise.all(
    Object.values(app.envs).map(async (env) => {
      const deployedPlugins = await getDeployedPlugins(appName, env.name);
      env.plugins = deployedPlugins;
    }),
  );
  return {
    name: 'testapp' + name,
  };
};
