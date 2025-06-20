const { asyncInvoke, getPluginId, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const schema = require('../schemas/pm/deletePlugin.json');
const logger = require('../logger').createLogger('muse.pm.deletePlugin');
/**
 * @module muse-core/pm/deletePlugin
 */

/**
 * @param {object} params Args to delete a plugin.
 * @param {string} params.pluginName The plugin name.
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 */

module.exports = async params => {
  validate(schema, params);
  const ctx = {};
  if (!params.author) params.author = osUsername;
  const { pluginName, author, msg } = params;
  logger.info(`Deleting plugin ${pluginName}...`);
  await asyncInvoke('museCore.pm.beforeDeletePlugin', ctx, params);

  const pid = getPluginId(pluginName);
  const pluginKeyPath = `/plugins/${pid}.yaml`;

  try {
    await asyncInvoke('museCore.pm.deletePlugin', ctx, params);
    await registry.del(pluginKeyPath, msg || `Deleted plugin ${pluginName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedDeletePlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterDeletePlugin', ctx, params);
  logger.info(`Delete plugin success: ${pluginName}...`);

  return ctx;
};
