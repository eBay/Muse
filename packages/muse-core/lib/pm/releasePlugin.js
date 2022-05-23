const yaml = require('js-yaml');
const { asyncInvoke, getPluginId, osUsername, genNewVersion } = require('../utils');
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

  const pid = getPluginId(pluginName);
  await asyncInvoke('museCore.pm.beforeReleasePlugin', ctx, params);

  ctx.release = {
    version: genNewVersion(releases?.[0]?.version, version),
    branch: '',
    sha: '',
    createdAt: new Date().toJSON(),
    createdBy: author,
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
  const releasesKeyPath = `/plugins/releases/${pid}.yaml`;
  await registry.set(
    releasesKeyPath,
    Buffer.from(yaml.dump(releases)),
    `Create release ${pluginName}@${ctx.release.version} by ${author}`,
  );

  // If build dir exists, upload it to assets storage
  if (buildDir) {
    await assets.uploadDir(
      buildDir,
      `/p/${pid}/v${ctx.release.version}`,
      `Release plugin ${pluginName}@${ctx.release.version} by ${author}.`,
    );
  }

  // await asyncInvoke('museCore.pm.releasePlugin', ctx, params);
  await asyncInvoke('museCore.pm.afterReleasePlugin', ctx, params);
};
