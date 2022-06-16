const { asyncInvoke, getPluginId, osUsername } = require('../utils');
const { assets } = require('../storage');
const { validate } = require('schema-utils');
const schema = require('../schemas/pm/deleteRelease.json');

/**
 * @module muse-core/pm/deleteRelease
 */
/**
 * @typedef {object} DeleteReleaseArgument
 * @property {string} pluginName the plugin name
 * @property {string} version the exact version you want to delete
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 */

/**
 *
 * @param {DeleteReleaseArgument} params args to delete a plugin
 */
module.exports = async (params) => {
  validate(schema, params);
  const { pluginName, version, author = osUsername, msg } = params;
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeDeleteReleases', ctx, pluginName);

  const pid = getPluginId(pluginName);
  const keyPath = `/p/${pid}/v${version}`;

  try {
    ctx.result = await assets.del(
      keyPath,
      msg || `Delete Release ${pluginName}@${version} by ${author}.`,
    );
    await asyncInvoke('museCore.pm.deleteReleases', ctx, pluginName);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedDeleteReleases', ctx, pluginName);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterDeleteReleases', ctx, pluginName);
};
