const { asyncInvoke, getPluginId, updateJson, osUsername } = require('../utils');
const getPlugin = require('./getPlugin');
const { registry } = require('../storage');
const { validate } = require('schema-utils');
const schema = require('../schemas/pm/updatePlugin.json');
const logger = require('../logger').createLogger('muse.pm.updatePlugin');

/**
 * @module muse-core/pm/updatePlugin
 */
/**
 * @typedef {object} UpdatePluginArgument
 * @property {string} pluginName the plugin name
 * @property {string} [appName] the app name
 * @property {string} [envName] the environment name
 * @property {object} [changes] the changes to apply
 * @property {null | object | object[]} [changes.set]
 * @property {null | object | object[]} [changes.unset]
 * @property {null | object | object[]} [changes.remove]
 * @property {null | object | object[]} [changes.push]
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 */

/**
 *
 * @param {UpdatePluginArgument} params args to update a plugin
 * @returns {object} plugin object
 */
module.exports = async (params) => {
  validate(schema, params);
  const { pluginName, appName, envName = 'staging', changes, author = osUsername, msg } = params;
  logger.info(`Updating plugin ${pluginName}...`);
  const ctx = {};

  await asyncInvoke('museCore.pm.beforeUpdatePlugin', ctx, params);

  try {
    const plugin = await getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} doesn't exist.`);
    }

    const pid = getPluginId(pluginName);
    const keyPath =
      appName && envName ? `/apps/${appName}/${envName}/${pid}.yaml` : `/plugins/${pid}.yaml`;

    ctx.plugin = await registry.getJsonByYaml(keyPath);
    updateJson(ctx.plugin, changes || {});

    await asyncInvoke('museCore.pm.updatePlugin', ctx, params);
    await registry.setYaml(keyPath, ctx.plugin, msg || `Update plugin ${pluginName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedUpdatePlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterUpdatePlugin', ctx, params);
  logger.info(`Update plugin success: ${pluginName}.`);
  return ctx.plugin;
};
