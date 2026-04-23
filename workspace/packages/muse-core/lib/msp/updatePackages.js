const semver = require('semver');
const { asyncInvoke, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getMsp = require('./getMsp');
const schema = require('../schemas/msp/updatePackages.json');
const logger = require('../logger').createLogger('muse.msp.updatePackages');

/**
 * @module muse-core/msp/updatePackages
 */

/**
 * @description Update package versions across all presets in /msp.yaml.
 * For each preset, only updates a package when the new version shares the same major version.
 * Skips pre-release versions unless allowPreRelease is true for that package.
 * @param {object} params
 * @param {object} params.pkgs Map of package name to { version, allowPreRelease }.
 * @param {string} [params.author=osUsername]
 * @param {string} [params.msg] Commit message.
 * @returns {object} The updated msp object.
 */
module.exports = async (params = {}) => {
  validate(schema, params);
  const ctx = {};
  if (!params.author) params.author = osUsername;
  const { pkgs, author, msg } = params;
  logger.info('Updating packages in msp...');
  await asyncInvoke('museCore.msp.beforeUpdatePackages', ctx, params);

  const msp = await getMsp();
  if (!msp) throw new Error('msp.yaml does not exist.');

  for (const preset of Object.values(msp)) {
    if (!preset.versions) continue;
    for (const [pkg, { version: newVersion, allowPreRelease = false }] of Object.entries(pkgs)) {
      const current = preset.versions[pkg];
      if (!current) continue;
      if (!allowPreRelease && semver.prerelease(newVersion)) continue;
      if (semver.major(newVersion) !== semver.major(current)) continue;
      preset.versions[pkg] = newVersion;
    }
  }

  ctx.msp = msp;

  try {
    await asyncInvoke('museCore.msp.updatePackages', ctx, params);
    await registry.setYaml('/msp.yaml', msp, msg || `Update packages in msp by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.msp.failedUpdatePackages', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.msp.afterUpdatePackages', ctx, params);
  logger.info('Update packages in msp success.');
  return ctx.msp;
};
