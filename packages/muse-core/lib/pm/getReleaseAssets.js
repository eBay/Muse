const { asyncInvoke, getPluginId, osUsername } = require('../utils');
const { assets } = require('../storage');
const { validate } = require('schema-utils');
const schema = require('../schemas/pm/getReleaseAssets.json');
/**
 * @module muse-core/pm/getReleaseAssets
 */
/**
 * @typedef {object} GetReleaseAssetsArgument
 * @property {string} pluginName the plugin name
 * @property {string} version the type of plugin
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 */

/**
 * @description List all static resource file information under a certain version
 * @param {GetReleaseAssetsArgument} params
 * @returns {object[]} list of object information
 */

module.exports = async (params) => {
  validate(schema, params);
  const { pluginName, version, author = osUsername, msg } = params;
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeGetReleaseAssets', ctx, pluginName);

  const pid = getPluginId(pluginName);
  const keyPath = `/p/${pid}/v${version}`;

  try {
    ctx.result = await assets.list(
      keyPath,
      msg || `List Release ${pluginName}@${version} by ${author}.`,
    );
    await asyncInvoke('museCore.pm.getReleaseAssets', ctx, pluginName);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedGetReleaseAssets', ctx, pluginName);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterGetReleaseAssets', ctx, pluginName);
  return ctx.result;
};
