const yaml = require('js-yaml');
const { asyncInvoke, getPluginId, updateJson, osUsername, validate } = require('../utils');
const getReleases = require('./getReleases');
const { registry } = require('../storage');
const schema = require('../schemas/pm/updateRelease.json');
const logger = require('../logger').createLogger('muse.pm.updateRelease');

module.exports = async function updateRelease(params) {
  if (!params) {
    throw new Error('params is required');
  }
  const { pluginName, version, changes, author = osUsername } = params;
  if (!pluginName || !version || !changes) {
    throw new Error('pluginName, version and changes are required');
  }
  validate(schema, params);

  const releases = await getReleases(pluginName);
  const release = releases.find((release) => release.version === version);
  if (!release) {
    throw new Error(`Release ${version} not found`);
  }
  logger.info(`Updating plugin release ${pluginName}@${version}...`);
  const ctx = {};

  await asyncInvoke('museCore.pm.beforeUpdateRelease', ctx, params);

  try {
    const updatedRelease = updateJson(release, changes);
    ctx.updatedRelease = updatedRelease;
    // replace the release with the updated one
    const index = releases.findIndex((release) => release.version === version);
    releases[index] = updatedRelease;
    await asyncInvoke('museCore.pm.updateRelease', ctx, params);
    const keyPath = `/plugins/releases/${getPluginId(pluginName)}.yaml`;
    await registry.set(
      keyPath,
      Buffer.from(yaml.dump(releases)),
      `Updated release ${pluginName}@${version} by ${author}`,
    );
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedUpdateRelease', ctx, params);
    throw err;
  }

  await asyncInvoke('museCore.pm.afterUpdateRelease', ctx, params);
  logger.info(`Updated plugin release success ...`);
  return ctx;
};
