const download = require('download');
const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const { asyncInvoke, syncInvoke, validate, getPluginId, osUsername } = require('../utils');
const logger = require('../logger').createLogger('muse.pm.installPlugin');
const schema = require('../schemas/pm/installPlugin.json');
const getPlugin = require('./getPlugin');
const createPlugin = require('./createPlugin');
const getReleases = require('./getReleases');
const releasePlugin = require('./releasePlugin');
syncInvoke('museCore.pm.processInstallPluginSchema', schema);

/**
 * @module muse-core/pm/installPlugin
 */
/**
 * @description Install a plugin from the specified npm registry.
 * @param {object}  params Args to release a plugin.
 * @param {string} params.pluginName The plugin name.
 * @param {string} [params.version="latest"] Semver version number type.
 * @returns {object} Release object.
 */
const installPlugin = async (params) => {
  if (!params.author) params.author = osUsername;
  validate(schema, params);
  const ctx = {};
  const {
    pluginName,
    version = 'latest',
    registry = 'https://registry.npmjs.org',
    author,
  } = params;
  let tmpDir;
  logger.info(`Installing plugin ${pluginName} from registry ${registry}...`);
  await asyncInvoke('museCore.pm.beforeInstallPlugin', ctx, params);
  try {
    const meta = JSON.parse(
      String(await download(_.trimEnd(registry, '/') + `/${pluginName}/${version}`)),
    );

    tmpDir = path.join(os.homedir(), 'muse-storage/.tmp/', getPluginId(pluginName), meta.version);
    fs.ensureDirSync(tmpDir);
    logger.info('Downloading the package...');
    await download(meta.dist.tarball, tmpDir, { extract: true });

    const pkgJson = fs.readJsonSync(path.join(tmpDir, 'package/package.json')); // JSON.parse(String(_.find(files, { path: 'package/package.json' }).data));
    ctx.pkgJson = pkgJson;
    if (!pkgJson.muse)
      throw new Error(
        `Package "${pluginName}" is not a Muse plugin (no muse section in package.json).`,
      );
    const plugin = await getPlugin(pluginName);
    if (!plugin) {
      // If plugin not exist, create a new one
      await createPlugin({
        pluginName,
        author,
        type: pkgJson.muse?.type || 'normal',
        options: { source: 'npm' },
        msg: `Installed plugin ${pluginName}@${pkgJson.version} by ${author}.`,
      });
    }
    const releases = await getReleases(pluginName);
    if (releases.find((r) => r.version === pkgJson.version)) {
      logger.warn(
        `Skipped install ${pkgJson.name}${pkgJson.version}: it has been already existed in Muse registry.`,
      );
    } else {
      logger.info(`Creating the release in Muse...`);
      await releasePlugin({
        pluginName,
        version: pkgJson.version,
        options: { source: 'npm' },
        projectRoot: path.join(tmpDir, 'package'),
        author,
        cwd: path.join(tmpDir, 'package'),
        msg: `Installed release ${pluginName}@${pkgJson.version} by ${author}.`,
      });
    }
    await asyncInvoke('museCore.pm.installPlugin', ctx, params);
  } catch (err) {
    ctx.error = err;
    err.message = `Failed to install plugin ${pluginName}. ${err.message}`;
    await asyncInvoke('museCore.pm.failedInstallPlugin', ctx, params);
    throw err;
  } finally {
    // if (tmpDir) fs.removeSync(tmpDir);
  }

  await asyncInvoke('museCore.pm.afterInstallPlugin', ctx, params);
  logger.verbose(`Install plugin ${pluginName} succeeded.`);
  return ctx.pkgJson;
};

module.exports = installPlugin;
