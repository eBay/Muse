const { assets } = require('../storage');
const { getPluginId } = require('../utils');
const getDeployedPlugins = require('./getDeployedPlugins');
const checkReleaseVersion = require('./checkReleaseVersion');
const logger = require('../logger').createLogger('muse.pm.checkDependencies');

const generateMissingDeps = async (ctx, appName, envName, depsManifest, buildEnv) => {
  // not all the plugins will have a deps-manifest.json, only the ones using shared lib plugins
  const depsLibsKeys = Object.keys(depsManifest.content);
  const deployedPlugins = await getDeployedPlugins(appName, envName);
  const deployedLibPlugins = deployedPlugins?.filter(dp => dp.type === 'lib');

  if (deployedLibPlugins) {
    for (const libPlugin of deployedLibPlugins) {
      // get each lib's lib-manifest.json
      const libPluginId = getPluginId(libPlugin.name);
      const libManifest = await assets.getJson(
        `/p/${libPluginId}/v${libPlugin.version}/${buildEnv}/lib-manifest.json`,
      );

      if (libManifest) {
        const libExportedDeps = Object.keys(libManifest.content);
        // now check, if deps from this library plugin (from deps-manifest.json) are met on the libs-manifest.json.
        // we strip the version here, because the version we have on deps-manifest.json comes from package.json,
        // while the version from deployed plugins has nothing to do with the one in package.json
        const currentDepsLibKey = depsLibsKeys.find(lib => lib.startsWith(libPlugin.name)); // e.g @ebay/muse-lib-react
        const currentDepsLibModules = depsManifest.content[currentDepsLibKey] || [];
        for (const exportedModule of currentDepsLibModules) {
          if (!libExportedDeps.includes(exportedModule)) {
            ctx.missingDeps[buildEnv][`${libPlugin.name}@${libPlugin.version}`]
              ? ctx.missingDeps[buildEnv][`${libPlugin.name}@${libPlugin.version}`].push(
                  exportedModule,
                )
              : (ctx.missingDeps[buildEnv][`${libPlugin.name}@${libPlugin.version}`] = [
                  exportedModule,
                ]);
          }
        }
      }
    }
  }
};
/**
 * API for checking shared library dependencies (usually before deploying a plugin)
 * @param { pluginName, version, appName, envName } params
 *
 * If this API returns a non-empty object (with keys), it means some library dependencies are not met.
 * Every key will correspond to a library plugin, and every value, an array of unsatisfied module dependencies.
 * e.g :
 *    {
 *       "@ebay/muse-lib-react@1.0.0": ['antd@4.20.0']
 *    }
 */
module.exports = async params => {
  const ctx = { missingDeps: { dev: [], dist: [] } };

  // check dependencies only if plugin type is NOT init / boot
  if (!['boot', 'init'].includes(params.pluginType)) {
    logger.verbose(`Checking plugin dependencies...`);

    // Check if release version exists (throws exception if no version/release found)
    // Or try getting the latest one automatically if none specified
    let version = await checkReleaseVersion({
      pluginName: params.pluginName,
      version: params.version,
    });

    const depsDistManifest = await assets.getJson(
      `/p/${params.pluginName}/v${version}/dist/deps-manifest.json`,
    );
    const depsDevManifest = await assets.getJson(
      `/p/${params.pluginName}/v${version}/dev/deps-manifest.json`,
    );

    if (depsDistManifest) {
      await generateMissingDeps(ctx, params.appName, params.envName, depsDistManifest, 'dist');
    }
    if (depsDevManifest) {
      await generateMissingDeps(ctx, params.appName, params.envName, depsDevManifest, 'dev');
    }
  }
  logger.verbose(`Plugin dependencies check finished.`);
  return ctx.missingDeps;
};
