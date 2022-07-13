const { asyncInvoke, getPluginId, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const { getApp } = require('../am');
const schema = require('../schemas/pm/undeployPlugin.json');
const logger = require('../logger').createLogger('muse.pm.undeployPlugin');
/**
 * @module muse-core/pm/undeployPlugin
 */

/**
 * @description Undeploy a plugin from an environment of an app.
 * @param {object} params Args to release a plugin.
 * @param {string} params.appName The app name.
 * @param {string} params.envName The environment.
 * @param {string} params.pluginName The plugin name.
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 * @returns {object}
 * @property {string} appName
 * @property {string} envName
 * @property {string} pluginName
 */

module.exports = async params => {
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
