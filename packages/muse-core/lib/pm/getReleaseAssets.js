const { asyncInvoke, getPluginId, osUsername, validate } = require('../utils');
const { assets } = require('../storage');
const schema = require('../schemas/pm/getReleaseAssets.json');
/**
 * @module muse-core/pm/getReleaseAssets
 */

/**
 * @description List all static resource file information under a certain version.
 * @param {object} params
 * @param {string} params.pluginName The plugin name.
 * @param {string} params.version The released version.
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 * @returns {object[]} List of object information.
 */

module.exports = async params => {
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
