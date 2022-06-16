const { asyncInvoke, jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');
const { getApp } = require('../am');
const { validate } = require('schema-utils');
const schema = require('../schemas/pm/getDeployedPlugins.json');
/**
 * @module muse-core/pm/getDeployedPlugins
 */
/**
 * @description Get information about all deployed plugins from an environment of an app
 * @param {string} appName app name
 * @param {string} envName enviroment
 * @returns {object[]} list of plugin object
 *
 */
module.exports = async (appName, envName) => {
  validate(schema, appName);
  validate(schema, envName);
  const ctx = {};

  await asyncInvoke('museCore.pm.beforeGetDeployedPlugins', ctx, appName, envName);

  const app = await getApp(appName);
  if (!app) {
    throw new Error(`App ${appName} doesn't exist.`);
  }

  if (!app.envs?.[envName]) {
    throw new Error(`Env ${appName}/${envName} doesn't exist.`);
  }

  try {
    const items = await registry.listWithContent(`/apps/${appName}/${envName}`);
    ctx.plugins = items.map((item) => jsonByYamlBuff(item.content));
    await asyncInvoke('museCore.pm.getDeployedPlugins', ctx, appName, envName);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedGetDeployedPlugins', ctx, appName, envName);
  }

  await asyncInvoke('museCore.pm.afterGetDeployedPlugins', ctx, appName, envName);
  return ctx.plugins;
};
