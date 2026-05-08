const download = require('download');
const _ = require('lodash');
const { asyncInvoke, osUsername, validate } = require('../utils');
const getMsp = require('./getMsp');
const updatePackages = require('./updatePackages');
const schema = require('../schemas/msp/syncLatest.json');
const logger = require('../logger').createLogger('muse.msp.syncLatest');

const DEFAULT_REGISTRY = 'https://registry.npmjs.org';

/**
 * @module muse-core/msp/syncLatest
 */

/**
 * @description Fetch the latest version of every package in msp.yaml from the npm registry
 * and call updatePackages to apply them.
 * @param {object} [params={}]
 * @param {string} [params.registry='https://registry.npmjs.org'] Custom npm registry URL.
 * @param {string} [params.author=osUsername]
 * @param {string} [params.msg] Commit message.
 * @returns {object} The updated msp object.
 */
module.exports = async (params = {}) => {
  validate(schema, params);
  const ctx = {};
  if (!params.author) params.author = osUsername;
  const { registry = DEFAULT_REGISTRY, author, msg } = params;
  const registryBase = _.trimEnd(registry, '/');
  logger.info(`Syncing latest package versions from ${registryBase}...`);
  await asyncInvoke('museCore.msp.beforeSyncLatest', ctx, params);

  try {
    const msp = await getMsp();
    if (!msp) throw new Error('msp.yaml does not exist.');

    // Collect all unique package names across all presets
    const pkgNames = _.uniq(
      Object.values(msp).flatMap((preset) => Object.keys(preset.versions || {})),
    );
    logger.verbose(`Fetching latest versions for ${pkgNames.length} packages...`);

    // Fetch latest version for each package in parallel
    const pkgEntries = await Promise.all(
      pkgNames.map(async (pkg) => {
        try {
          const meta = JSON.parse(String(await download(`${registryBase}/${pkg}/latest`)));
          return [pkg, { version: meta.version, allowPreRelease: false }];
        } catch (err) {
          logger.warn(`Failed to fetch latest version for ${pkg}: ${err.message}`);
          return null;
        }
      }),
    );

    const pkgs = Object.fromEntries(pkgEntries.filter(Boolean));
    logger.verbose(`Fetched latest versions for ${Object.keys(pkgs).length} packages.`);

    ctx.msp = await updatePackages({
      pkgs,
      author,
      msg: msg || `Sync latest package versions by ${author}`,
    });

    await asyncInvoke('museCore.msp.syncLatest', ctx, params);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.msp.failedSyncLatest', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.msp.afterSyncLatest', ctx, params);
  logger.info('Sync latest finished.');
  return ctx.msp;
};
