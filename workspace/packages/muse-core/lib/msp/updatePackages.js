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
 * @description Update package versions in /msp.yaml.
 * For each targeted preset, only updates a package when the new version shares the same major version,
 * unless the package does not yet exist and allowNew is true for that package entry.
 * Skips pre-release versions unless allowPreRelease is true for that package.
 * Setting remove: true for a package entry removes it from the preset's versions.
 * @param {object} params
 * @param {object} params.pkgs Map of package name to { version, allowPreRelease, allowNew, remove }.
 * @param {string} [params.name] If provided, only update the named preset. Otherwise updates all presets.
 * @param {string} [params.author=osUsername]
 * @param {string} [params.msg] Commit message.
 * @returns {object} The updated msp object.
 */
module.exports = async (params = {}) => {
  validate(schema, params);
  const ctx = {};
  if (!params.author) params.author = osUsername;
  const { pkgs, name, author, msg } = params;
  logger.info('Updating packages in msp...');
  await asyncInvoke('museCore.msp.beforeUpdatePackages', ctx, params);

  const msp = await getMsp();
  if (!msp) throw new Error('msp.yaml does not exist.');

  if (name && !msp[name]) throw new Error(`Preset ${name} does not exist.`);
  const presets = name ? { [name]: msp[name] } : msp;

  for (const preset of Object.values(presets)) {
    if (!preset.versions) preset.versions = {};
    for (const [pkg, { version: newVersion, allowPreRelease = false, allowNew = false, remove = false }] of Object.entries(pkgs)) {
      if (remove) {
        delete preset.versions[pkg];
        continue;
      }
      const current = preset.versions[pkg];
      if (!current) {
        if (allowNew) preset.versions[pkg] = newVersion;
        continue;
      }
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
