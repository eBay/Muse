const yaml = require('js-yaml');
const fs = require('fs-extra');
const {
  asyncInvoke,
  getPluginId,
  osUsername,
  genNewVersion,

  validate,
} = require('../utils');
const { registry } = require('../storage');
const getReleases = require('./getReleases');
const getPlugin = require('./getPlugin');
const releasePluginAssets = require('./releasePluginAssets');
const schema = require('../schemas/pm/releasePlugin.json');
const logger = require('../logger').createLogger('muse.pm.releasePlugin');
/**
 * @module muse-core/pm/releasePlugin
 */

/**
 * @description Release a new version of a plugin.
 * if the buildDir is not empty, will upload the build directory to assets storag
 * @param {object}  params Args to release a plugin.
 * @param {string} params.pluginName The plugin name.
 * @param {string} [params.version="patch"] Semver version number type.
 * @param {string} [params.buildDir] Output directory of bundles.
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 * @param {object} [params.options]
 * @returns {object} Release object.
 */

module.exports = async params => {
  validate(schema, params);
  const ctx = {};
  if (!params.author) params.author = osUsername;
  const {
    pluginName,
    buildDir,
    branch = '',
    sha = '',
    version = 'patch',
    author,
    options,
  } = params;
  await asyncInvoke('museCore.pm.beforeReleasePlugin', ctx, params);

  // Check if plugin exists
  const plugin = await getPlugin(pluginName);
  if (!plugin) throw new Error(`Plugin ${pluginName} doesn't exist.`);

  // Check if release exists
  const releases = await getReleases(pluginName);

  if (releases?.find(r => r.version === version)) {
    throw new Error(`Version ${version} already exists for plugin ${pluginName}`);
  }

  const pid = getPluginId(pluginName);
  const newVersion = genNewVersion(releases?.[0]?.version, version);
  logger.info(`Creating release ${pluginName}@${newVersion}...`);

  ctx.release = {
    pluginName,
    version: newVersion,
    branch,
    sha,
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

  // If build dir exists, compress into a zip file and upload it and the unzip files to assets storage
  if (fs.existsSync(buildDir)) {
    await releasePluginAssets({ pluginName, version: newVersion, buildDir, author });
  }

  // Save releases to registry
  const releasesKeyPath = `/plugins/releases/${pid}.yaml`;
  await registry.set(
    releasesKeyPath,
    Buffer.from(yaml.dump(releases)),
    `Created release ${pluginName}@${ctx.release.version} by ${author}`,
  );

  await asyncInvoke('museCore.pm.afterReleasePlugin', ctx, params);
  logger.info(`Succeeded to create release ${pluginName}@${ctx.release.version}.`);

  return ctx.release;
};
