const { asyncInvoke, getPluginId, osUsername, validate  } = require('../utils');
const { assets } = require('../storage');
const yaml = require('js-yaml');
const { registry } = require('../storage');
const getReleases = require('./getReleases');
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
 * @property {boolean} [delAssets] delete related assets
 */

/**
 *
 * @param {DeleteReleaseArgument} params args to delete a plugin
 */
module.exports = async (params) => {
  validate(schema, params);
  const { pluginName, version, author = osUsername, msg, delAssets = false } = params;
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeDeleteRelease', ctx, pluginName);
  logger.verbose(`Call ext point museCore.pm.beforeDeleteRelease completed`);

  try {
    const pid = getPluginId(pluginName);
    if (!pid) {
      throw new Error(`Plugin ${pluginName} doesn't exist.`);
    }

    const releases = await getReleases(pluginName);
    const releaseToDelete = releases.find((rel) => rel.version === version);
    if (!releaseToDelete) {
      logger.warn(`Version ${version} doesn't exist or has been already unregistered.`);
    } else {
      const updatedReleases = releases.filter((rel) => rel.version !== version);
      ctx.releases = updatedReleases;

      // Save updated releases (without the now deleted version) to registry
      const releasesKeyPath = `/plugins/releases/${pid}.yaml`;
      await registry.set(
        releasesKeyPath,
        Buffer.from(yaml.dump(updatedReleases)),
        `Unregistered release ${pluginName}@${version} by ${author}`,
      );
    }

    if (delAssets) {
      const keyPath = `/p/${pid}/v${version}`;
      ctx.result = await assets.del(
        keyPath,
        msg || `Deleted Release ${pluginName}@${version} by ${author}.`,
      );
    }
    await asyncInvoke('museCore.pm.deleteRelease', ctx, pluginName);
    logger.verbose(`Call ext museCore.pm.deleteRelease completed`);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedDeleteRelease', ctx, pluginName);
    logger.verbose(`Call ext museCore.pm.failedDeleteRelease completed`);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterDeleteRelease', ctx, pluginName);
  logger.verbose(`Call ext museCore.pm.afterDeleteRelease completed`);
  logger.info(
    `${delAssets ? 'Delete' : 'Unregister'} plugin release ${pluginName}@${version} finished`,
  );
  return ctx.releases;
};
