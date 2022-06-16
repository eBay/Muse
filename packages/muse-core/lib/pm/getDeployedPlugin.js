const { asyncInvoke, getPluginId, jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');
const { getApp } = require('../am');
const { validate } = require('schema-utils');
const schema = require('../schemas/pm/getDeployedPlugin.json');
/**
 * @module muse-core/pm/getDeployedPlugin
 */
/**
 * @description Get information about a deployed plugin from an environment of an app
 * @param {string} appName app name
 * @param {string} envName enviroment
 * @param {string} pluginName plugin name
 * @returns {object} plugin object
 *
 */
module.exports = async (appName, envName, pluginName) => {
  validate(schema, appName);
  validate(schema, envName);
  validate(schema, pluginName);
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeGetDeployedPlugin', ctx, appName, envName, pluginName);

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
    ctx.plugin = jsonByYamlBuff(await registry.get(keyPath));
    await asyncInvoke('museCore.pm.getDeployedPlugin', ctx, appName, envName, pluginName);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedGetDeployedPlugin', ctx, appName, envName, pluginName);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterGetDeployedPlugin', ctx, appName, envName, pluginName);
  return ctx.plugin;
};
