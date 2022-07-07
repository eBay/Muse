const { asyncInvoke, osUsername, validate } = require('../utils');
const { assets } = require('../storage');
const unregisterRelease = require('./unregisterRelease');
const schema = require('../schemas/pm/deleteRelease.json');
const logger = require('../logger').createLogger('muse.pm.deleteRelease');

/**
 * @module muse-core/pm/deleteRelease
 */
/**
 * @param {object} params Args to delete a plugin.
 * @param {string} params.pluginName The plugin name.
 * @param {string} params.version The exact version you want to delete.
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 */

module.exports = async params => {
  validate(schema, params);
  const { pluginName, version, author = osUsername, msg } = params;
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeDeleteRelease', ctx, params);
  logger.verbose(`Call ext point museCore.pm.beforeDeleteRelease completed`);

  try {
    const { pid } = await unregisterRelease({ pluginName, version, author, msg });
    const keyPath = `/p/${pid}/v${version}`;
    ctx.result = await assets.delDir(
      keyPath,
      msg || `Deleted Release ${pluginName}@${version} by ${author}.`,
    );

    await asyncInvoke('museCore.pm.deleteRelease', ctx, params);
    logger.verbose(`Call ext museCore.pm.deleteRelease completed`);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedDeleteRelease', ctx, params);
    logger.verbose(`Call ext museCore.pm.failedDeleteRelease completed`);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterDeleteRelease', ctx, params);
  logger.verbose(`Call ext museCore.pm.afterDeleteRelease completed`);
  logger.info(`Delete plugin release ${pluginName}@${version} finished`);
  return ctx.releases;
};
