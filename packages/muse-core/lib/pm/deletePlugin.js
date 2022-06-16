const { asyncInvoke, getPluginId, osUsername } = require('../utils');
const { registry } = require('../storage');
const { validate } = require('schema-utils');
const schema = require('../schemas/pm/deletePlugin.json');
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
  await asyncInvoke('museCore.pm.beforeDeletePlugin', ctx, params);

  const { pluginName, author = osUsername, msg } = params;

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
};
