const { asyncInvoke, osUsername } = require('../utils');
const { assets } = require('../storage');
const unregisterRelease = require('./unregisterRelease');
const { validate } = require('schema-utils');
const schema = require('../schemas/pm/deleteRelease.json');
const logger = require('../logger').createLogger('muse.pm.deleteRelease');

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
module.exports = async params => {
  validate(schema, params);
  const { pluginName, version, author = osUsername, msg } = params;
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeDeleteRelease', ctx, pluginName);
  logger.verbose(`Call ext point museCore.pm.beforeDeleteRelease completed`);

  try {
    const { pid } = await unregisterRelease({ pluginName, version, author, msg });
    const keyPath = `/p/${pid}/v${version}`;
    ctx.result = await assets.delDir(
      keyPath,
      msg || `Deleted Release ${pluginName}@${version} by ${author}.`,
    );

    await asyncInvoke('museCore.pm.deleteRelease', ctx, pluginName);
    logger.verbose(`Call ext museCore.pm.deleteRelease completed`);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedDeleteRelease', ctx, pluginName);
    logger.verbose(`Call ext museCore.pm.failedDeleteRelease completed`);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterDeleteRelease', ctx, pluginName);
  logger.verbose(`Call ext museCore.pm.afterDeleteRelease completed`);
  logger.info(`Delete plugin release ${pluginName}@${version} finished`);
  return ctx.releases;
};
