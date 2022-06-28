const { asyncInvoke, getPluginId, osUsername, validate  } = require('../utils');
const { registry } = require('../storage');
const schema = require('../schemas/pm/deletePlugin.json');
const logger = require('../logger').createLogger('muse.pm.deletePlugin');
/**
 * @module muse-core/pm/deletePlugin
 */
/**
 * @typedef {object} DeletePluginArgument
 * @property {string} pluginName the plugin name
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 */

/**
 *
 * @param {DeletePluginArgument} params args to delete a plugin
 */

module.exports = async (params) => {
  validate(schema, params);
  const ctx = {};
  const { pluginName, author = osUsername, msg } = params;
  logger.info(`Deleting plugin ${pluginName}...`);
  await asyncInvoke('museCore.pm.beforeDeletePlugin', ctx, params);

  const pid = getPluginId(pluginName);
  const pluginKeyPath = `/plugins/${pid}.yaml`;

  try {
    await asyncInvoke('museCore.pm.deletePlugin', ctx, params);
    await registry.del(pluginKeyPath, msg || `Delete plugin ${pluginName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedDeletePlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterDeletePlugin', ctx, params);
  logger.info(`Delete plugin success: ${pluginName}...`);

  return ctx;
};
