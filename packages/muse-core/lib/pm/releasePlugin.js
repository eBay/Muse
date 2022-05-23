const yaml = require('js-yaml');
const semver = require('semver');
const { asyncInvoke, getPluginId, osUsername } = require('../utils');
const { assets, registry } = require('../storage');
// const registerRelease = require('./registerRelease');
const getReleases = require('./getReleases');
const getPlugin = require('./getPlugin');

module.exports = async (params) => {
  const ctx = {};
  const { pluginName, buildDir, version = 'patch', author = osUsername, options } = params;

  // Check if plugin exists
  const plugin = await getPlugin(pluginName);
  if (!plugin) throw new Error(`Plugin ${pluginName} doesn't exist.`);

  // Check if release exists
  const releases = await getReleases(pluginName);

  if (releases?.find((r) => r.version === version)) {
    throw new Error(`Version ${version} already exists for plugin ${pluginName}`);
  }

  const latestRelease = releases[0];
  const pid = getPluginId(pluginName);
  await asyncInvoke('museCore.pm.beforeReleasePlugin', ctx, params);
  // const { pluginName, buildDir, version, author = osUsername, options } = params;
  const releasesKeyPath = `/plugins/releases/${pid}.yaml`;

  ctx.release = {
    version: newVersion,
    branch: '',
    sha: '',
    createdAt: new Date().toJSON(),
    author,
    description: '',
    // info: (await fs.readJson(path.join(buildDir, 'info.json'), { throws: false })) || {},
    ...options,
  };

  await asyncInvoke('museCore.pm.releasePlugin', ctx, params);

  releases.unshift(ctx.release);
  if (releases.length > 100) {
    // TODO: archive old releases?
    // TODO: make it configurable?
    // Keep up to 100 releases
    releases.length = 100;
  }

  // Save releases to registry
  await registry.set(
    releasesKeyPath,
    Buffer.from(yaml.dump(releases)),
    `Create release ${pluginName}@${version} by ${author}`,
  );

  // If build dir exists, upload it to assets storage
  if (buildDir) {
    await assets.uploadDir(buildDir, `/p/${pid}/v${version}`, `Release plugin ${pluginName}@${version} by ${author}.`);
  }

  // await asyncInvoke('museCore.pm.releasePlugin', ctx, params);
  await asyncInvoke('museCore.pm.afterReleasePlugin', ctx, params);
};
