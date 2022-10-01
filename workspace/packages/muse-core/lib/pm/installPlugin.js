const download = require('download');
const _ = require('lodash');
const {
  asyncInvoke,
  syncInvoke,
  validate,
  getPluginId,
  osUsername,
  batchAsync,
} = require('../utils');
const { assets } = require('../storage');
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
const installPlugin = async params => {
  if (!params.author) params.author = osUsername;
  validate(schema, params);
  const ctx = {};
  const {
    pluginName,
    version = 'latest',
    registry = 'https://registry.npmjs.org',
    author,
  } = params;
  logger.verbose(`Installing plugin ${pluginName} from registry ${registry}...`);
  await asyncInvoke('museCore.pm.beforeInstallPlugin', ctx, params);
  try {
    const meta = JSON.parse(
      String(await download(_.trimEnd(registry, '/') + `/${pluginName}/${version}`)),
    );

    const files = await download(meta.dist.tarball, { extract: true });
    const pkgJson = JSON.parse(String(_.find(files, { path: 'package/package.json' }).data));
    ctx.pkgJson = pkgJson;
    if (!pkgJson.muse)
      throw new Error(
        `Package "${pluginName}" is not to be a Muse plugin (no muse section in package.json).`,
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
    if (releases.find(r => r.version === pkgJson.version)) {
      logger.info(
        `Skipped install ${pkgJson.name}${pkgJson.version}: it's already exists in Muse registry.`,
      );
    } else {
      await releasePlugin({
        pluginName,
        version: pkgJson.version,
        options: { source: 'npm' },
        author,
        msg: `Installed release ${pluginName}@${pkgJson.version} by ${author}.`,
      });
      const pid = getPluginId(pluginName);
      logger.verbose(`Uploading plugin assets ${pluginName}@${pkgJson.version}...`);

      await batchAsync(
        files
          .filter(f => f.path.startsWith('package/build/'))
          .map(file => async () => {
            await assets.set(
              `/p/${pid}/v${pkgJson.version}/${file.path.replace('package/build/', '')}`,
              file.data,
            );
          }),
        { size: 50, msg: 'Uploading plugin asset from npm package.' },
      );
    }
    await asyncInvoke('museCore.pm.installPlugin', ctx, params);
  } catch (err) {
    ctx.error = err;
    err.message = `Failed to install plugin ${pluginName}. ${err.message}`;
    await asyncInvoke('museCore.pm.failedInstallPlugin', ctx, params);
    throw err;
  }

  await asyncInvoke('museCore.pm.afterInstallPlugin', ctx, params);
  logger.verbose(`Install plugin ${pluginName} succeeded.`);
  return ctx.pkgJson;
};

module.exports = installPlugin;
