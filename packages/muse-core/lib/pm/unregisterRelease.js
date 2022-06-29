const { asyncInvoke, getPluginId, osUsername } = require('../utils');
const yaml = require('js-yaml');
const { registry } = require('../storage');
const getReleases = require('./getReleases');
const { validate } = require('schema-utils');
const schema = require('../schemas/pm/unregisterRelease.json');
const logger = require('../logger').createLogger('muse.pm.unregisterRelease');

/**
 * @module muse-core/pm/unregisterRelease
 */
/**
 * @typedef {object} UnregisterReleaseArgument
 * @property {string} pluginName the plugin name
 * @property {string} version the exact version you want to delete
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 */

/**
 *
 * @param {UnregisterReleaseArgument} params args to delete a plugin
 */
module.exports = async params => {
  validate(schema, params);
  const { pluginName, version, author = osUsername, msg } = params;
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeUnregisterRelease', ctx, pluginName);
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
    await asyncInvoke('museCore.pm.unregisterRelease', ctx, pluginName);
    logger.verbose(`Call ext museCore.pm.unregisterRelease completed`);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedUnregisterRelease', ctx, pluginName);
    logger.verbose(`Call ext museCore.pm.failedUnregisterRelease completed`);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterUnregisterRelease', ctx, pluginName);
  logger.verbose(`Call ext museCore.pm.afterUnregisterRelease completed`);
  logger.info(`Unregister plugin release ${pluginName}@${version} finished`);
  return ctx;
};
