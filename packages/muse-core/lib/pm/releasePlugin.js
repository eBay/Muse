const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs-extra');
const { asyncInvoke, getPluginId, osUsername, genNewVersion, doZip } = require('../utils');
const { assets, registry } = require('../storage');
const getReleases = require('./getReleases');
const getPlugin = require('./getPlugin');
const { validate } = require('schema-utils');
const schema = require('../schemas/pm/releasePlugin.json');
const logger = require('../logger').createLogger('muse.pm.releasePlugin');
/**
 * @module muse-core/pm/releasePlugin
 */
/**
 * @typedef {object} ReleasePluginArgument
 * @property {string} pluginName the plugin name
 * @property {string} [version="patch"] semver version number type
 * @property {string} [buildDir] output directory of bundles
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 * @property {object} [options]
 */

/**
 * @description Release a new version of a plugin
 * if the buildDir is not empty, will upload the build directory to assets storag
 * @param {ReleasePluginArgument} params args to release a plugin
 * @returns {object} release object
 */

module.exports = async (params) => {
  validate(schema, params);
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
  const newVersion = genNewVersion(releases?.[0]?.version, version);
  logger.info(`Creating release ${pluginName}@${newVersion}...`);

  ctx.release = {
    pluginName,
    version: newVersion,
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

  // If build dir exists, compress into a zip file and upload it and the unzip files to assets storage
  if (buildDir) {
    try {
      const zipFile = path.join(process.cwd(), 'tmp', 'assets.zip');
      fs.ensureDirSync('./tmp');
      await doZip(buildDir, zipFile);
      // Move files to build folder first and then upload assets to nuobject for the migration
      await fs.moveSync(
        path.join(process.cwd(), 'tmp/assets.zip'),
        path.join(process.cwd(), 'build/assets.zip'),
        { overwrite: true },
      );
    } catch (err) {
      logger.warn(err);
    }
    await assets.uploadDir(
      buildDir,
      `/p/${pid}/v${ctx.release.version}`,
      `Release plugin ${pluginName}@${ctx.release.version} by ${author}.`,
    );
  }

  // await asyncInvoke('museCore.pm.releasePlugin', ctx, params);
  await asyncInvoke('museCore.pm.afterReleasePlugin', ctx, params);
  logger.info(`Succeeded to create release ${pluginName}@${ctx.release.version}.`);

  return ctx.release;
};
