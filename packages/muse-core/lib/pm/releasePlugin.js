// Register a release and upload assets to the storage
// NOTE: this method usually takes long time, don't call it as rest API but from some job.

const { asyncInvoke, getPluginId } = require('../utils');
const { assets } = require('../storage');
const registerRelease = require('./registerRelease');
const getReleases = require('./getReleases');
const getPlugin = require('./getPlugin');

module.exports = async (params) => {
  const ctx = {};
  const { pluginName, buildDir, version, author } = params;

  // Check if plugin exists
  const plugin = await getPlugin(pluginName);
  if (!plugin) throw new Error(`Plugin ${pluginName} doesn't exist.`);

  // Check if release exists
  const releases = await getReleases(pluginName);
  if (releases?.releases?.find((r) => r.version === version)) {
    throw new Error(`Version ${version} already exists for plugin ${pluginName}`);
  }

  const pid = getPluginId(pluginName);
  await asyncInvoke('museCore.pm.beforeReleasePlugin', ctx, params);
  await registerRelease(params);
  await assets.uploadDir(buildDir, `/p/${pid}/v${version}`, `Release plugin ${pluginName}@${version} by ${author}.`);

  await asyncInvoke('museCore.pm.releasePlugin', ctx, params);
  await asyncInvoke('museCore.pm.afterReleasePlugin', ctx, params);
};
