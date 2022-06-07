const { asyncInvoke, getPluginId, osUsername } = require('../utils');
const { registry } = require('../storage');
const { getApp } = require('../am');

module.exports = async (params) => {
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeUndeployPlugin', ctx, params);

  const { appName, envName, pluginName, author = osUsername, msg } = params;

  const app = await getApp(appName);
  if (!app) {
    throw new Error(`App ${appName} doesn't exist.`);
  }

  if (!app.envs?.[envName]) {
    throw new Error(`Env ${appName}/${envName} doesn't exist.`);
  }

  try {
    const pid = getPluginId(pluginName);
    const keyPath = `/apps/${appName}/${envName}/${pid}.yaml`;

    await asyncInvoke('museCore.pm.undeployPlugin', ctx, params);
    await registry.del(keyPath, msg || `Undeploy plugin ${pluginName} by ${author}`);
  } catch (err) {
    console.log(err);
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedUndeployPlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterUndeployPlugin', ctx, params);
  return {
    appName,
    envName,
    pluginName,
  };
};
