const { assets } = require('../storage');
const getDeployedPlugins = require('./getDeployedPlugins');

/**
 * API for checking shared library dependencies (usually before deploying a plugin)
 * @param { pluginName, version, appName, envName } params
 *
 * If this API returns a non-empty object (with keys), it means some library dependencies are not met.
 * Every key will correspond to a library plugin, and every value, an array of unsatisfied module dependencies.
 * e.g :
 *    {
 *       "@ebay/muse-react@1.0.0": ['antd@4.20.0']
 *    }
 */
module.exports = async (params) => {
  const ctx = { missingDeps: {} };
  const depsManifest = await assets.getJson(
    decodeURIComponent(`p/${params.pluginName}/v${params.version}/dist/deps-manifest.json`),
  );

  if (depsManifest) {
    // not all the plugins will have a deps-manifest.json, only the ones using shared lib plugins
    const depsLibsKeys = Object.keys(depsManifest.content);
    const deployedPlugins = await getDeployedPlugins(params.appName, params.envName);
    const deployedLibPlugins = deployedPlugins?.filter((dp) => dp.type === 'lib');

    if (deployedLibPlugins) {
      for (const libPlugin of deployedLibPlugins) {
        // get each lib's lib-manifest.json
        const parsedLibName = libPlugin.name.replace('/', '.');
        const libManifest = await assets.getJson(
          decodeURIComponent(`p/${parsedLibName}/v${libPlugin.version}/dist/lib-manifest.json`),
        );

        if (libManifest) {
          const libExportedDeps = Object.keys(libManifest.content);
          // now check, if deps from this library plugin (from deps-manifest.json) are met on the libs-manifest.json.
          // we strip the version here, because the version we have on deps-manifest.json comes from package.json,
          // while the version from deployed plugins has nothing to do with the one in package.json
          const currentDepsLibKey = depsLibsKeys.find((lib) => lib.startsWith(libPlugin.name)); // e.g @ebay/muse-react
          const currentDepsLibModules = depsManifest.content[currentDepsLibKey];
          for (const exportedModule of currentDepsLibModules) {
            if (!libExportedDeps.includes(exportedModule)) {
              ctx.missingDeps[`${libPlugin.name}@${libPlugin.version}`]
                ? ctx.missingDeps[`${libPlugin.name}@${libPlugin.version}`].push(exportedModule)
                : (ctx.missingDeps[`${libPlugin.name}@${libPlugin.version}`] = [exportedModule]);
            }
          }
        }
      }
    }
  }
  return ctx.missingDeps;
};
