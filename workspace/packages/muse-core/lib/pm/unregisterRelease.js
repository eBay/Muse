const { asyncInvoke, getPluginId, osUsername, validate } = require('../utils');
const yaml = require('js-yaml');
const { registry } = require('../storage');
const getReleases = require('./getReleases');
const schema = require('../schemas/pm/unregisterRelease.json');
const logger = require('../logger').createLogger('muse.pm.unregisterRelease');

/**
 * @module muse-core/pm/unregisterRelease
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
  await asyncInvoke('museCore.pm.beforeUnregisterRelease', ctx, params);
  logger.verbose(`Call ext point museCore.pm.beforeUnregisterRelease completed`);

  try {
    const pid = getPluginId(pluginName);
    if (!pid) {
      throw new Error(`Plugin ${pluginName} doesn't exist.`);
    }

    ctx.pid = pid;

    const releases = await getReleases(pluginName);
    const releaseToDelete = releases.find(rel => rel.version === version);
    if (!releaseToDelete) {
      logger.warn(`Version ${version} doesn't exist or has been already unregistered.`);
    } else {
      const updatedReleases = releases.filter(rel => rel.version !== version);
      ctx.releases = updatedReleases;

      // Save updated releases (without the now deleted version) to registry
      const releasesKeyPath = `/plugins/releases/${pid}.yaml`;
      await registry.set(
        releasesKeyPath,
        Buffer.from(yaml.dump(updatedReleases)),
        msg || `Unregistered release ${pluginName}@${version} by ${author}`,
      );
    }
    await asyncInvoke('museCore.pm.unregisterRelease', ctx, params);
    logger.verbose(`Call ext museCore.pm.unregisterRelease completed`);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedUnregisterRelease', ctx, params);
    logger.verbose(`Call ext museCore.pm.failedUnregisterRelease completed`);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterUnregisterRelease', ctx, params);
  logger.verbose(`Call ext museCore.pm.afterUnregisterRelease completed`);
  logger.info(`Unregister plugin release ${pluginName}@${version} finished`);
  return ctx;
};
