const yaml = require('js-yaml');
const { asyncInvoke, getPluginId, updateJson } = require('../utils');
const { registry } = require('../storage');
const getPlugin = require('./getPlugin');
const { getApp } = require('../am');
const getDeployedPlugin = require('./getDeployedPlugin');

module.exports = async (params) => {
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeDeployPlugin', ctx, params);

  const { appName, envName, pluginName, version, options, changes, author } = params;

  // Check if plugin name exist
  const p = await getPlugin(pluginName);
  if (!p) {
    throw new Error(`Plugin ${pluginName} doesn't exist.`);
  }

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
    ctx.plugin = (await getDeployedPlugin(appName, envName, pluginName)) || { name: pluginName };
    Object.assign(ctx.plugin, {
      version,
      ...options,
    });
    updateJson(ctx.plugin, changes || {});
    await asyncInvoke('museCore.pm.deployPlugin', ctx, params);
    await registry.set(keyPath, Buffer.from(yaml.dump(ctx.plugin)), `Create plugin ${pluginName} by ${author}`);
  } catch (err) {
    console.log(err);
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedDeployPlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterDeployPlugin', ctx, params);
};
