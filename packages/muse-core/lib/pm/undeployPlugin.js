const { asyncInvoke, getPluginId, osUsername } = require('../utils');
const { registry } = require('../storage');
const { getApp } = require('../am');
const { validate } = require('schema-utils');
const schema = require('../schemas/pm/undeployPlugin.json');
const logger = require('../logger').createLogger('muse.pm.undeployPlugin');
/**
 * @module muse-core/pm/undeployPlugin
 */
/**
 * @typedef {object} UndeployPluginArgument
 * @property {string} appName the app name
 * @property {string} envName the environment
 * @property {string} pluginName the plugin name
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 */

/**
 * @description Undeploy a plugin from an environment of an app
 * @param {UndeployPluginArgument} params args to release a plugin
 * @returns {object}
 * @property {string} appName
 * @property {string} envName
 * @property {string} pluginName
 */

module.exports = async (params) => {
  validate(schema, params);
  const ctx = {};
  const { appName, envName, pluginName, author = osUsername, msg } = params;
  logger.verbose(`Undeploying plugin ${pluginName}@${appName}/${envName}...`);
  await asyncInvoke('museCore.pm.beforeUndeployPlugin', ctx, params);

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
  logger.verbose(`Succeeded to undeploy plugin: ${pluginName}@${appName}/${envName}.`);

  return {
    appName,
    envName,
    pluginName,
  };
};
