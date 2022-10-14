const path = require('path');
const fs = require('fs-extra');
const { asyncInvoke, getPluginId, osUsername, doZip, validate } = require('../utils');
const { assets } = require('../storage');
const schema = require('../schemas/pm/releasePluginAssets.json');
const logger = require('../logger').createLogger('muse.pm.releasePluginAssets');
/**
 * @module muse-core/pm/releasePlugin
 */

async function archiveAssets(projectRoot) {
  const assets = [
    {
      sourceDir: 'build',
      targetFile: 'assets.zip',
    },
    {
      sourceDir: 'e2e-tests',
      targetFile: 'e2e-tests.zip',
    },
  ];
  fs.ensureDirSync(path.join(projectRoot, 'tmp'));
  for (let i = 0; i < assets.length; i++) {
    const sourceDir = path.join(projectRoot, assets[i].sourceDir);
    if (!fs.existsSync(sourceDir)) {
      // TODO: throw error if source not exist??
      // throw new Error(`Asset folder ${assets[i].sourceDir} doesn't exist, failed to release.`);
      continue;
    }
    const zipFile = path.join(projectRoot, 'tmp', assets[i].targetFile);
    await doZip(sourceDir, zipFile);
    await fs.moveSync(zipFile, path.join(projectRoot, `build/${assets[i].targetFile}`), {
      overwrite: true,
    });
  }
}

/**
 * @description Release a new version of plugin assets.
 * Upload the build directory to assets storage
 * @param {object} params Args to release plugin assets.
 * @param {string} params.pluginName The plugin name.
 * @param {string} params.version Semver version number type.
 * @param {string} params.buildDir Output directory of bundles.
 * @returns {object} Release object.
 */

module.exports = async params => {
  validate(schema, params);
  const ctx = {};
  if (!params.author) params.author = osUsername;
  const { pluginName, version, author, projectRoot } = params;
  await asyncInvoke('museCore.pm.beforeReleasePluginAssets', ctx, params);

  const pid = getPluginId(pluginName);

  // If build dir exists, compress into a zip file and upload it and the unzip files to assets storage
  try {
    await archiveAssets(projectRoot);
    await asyncInvoke('museCore.pm.releasePluginAssets', ctx, params);
    await assets.uploadDir(
      path.join(projectRoot, 'build'),
      `/p/${pid}/v${version}`,
      `Release plugin assets of ${pluginName}@${version} by ${author}.`,
    );
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.releasePluginAssets', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterReleasePluginAssets', ctx, params);

  logger.info(`Succeeded to release plugin assets ${pluginName}@${version}.`);
  return ctx.release;
};
