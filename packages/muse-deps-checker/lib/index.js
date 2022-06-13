const muse = require('muse-core');

module.exports = {
    name: 'muse-deps-checker',
    museCore: {
      pm: {
        beforeDeployPlugin: async (ctx, params) => {
          const depsManifest = await muse.storage.assets.getJson(decodeURIComponent(`p/${params.pluginName}/v${params.version}/dist/deps-manifest.json`));
          if (depsManifest) {
            // not all the plugins will have a deps-manifest.json, only the ones using shared lib plugins
            const depsLibsKeys = Object.keys(depsManifest.content);
            const deployedPlugins = await muse.pm.getDeployedPlugins(params.appName, params.envName);
            const deployedLibPlugins = deployedPlugins?.filter(dp => dp.type ==='lib');

            if (deployedLibPlugins) {
              for (const libPlugin of deployedLibPlugins) {
                // get each lib's lib-manifest.json
                const libManifest = await muse.storage.assets.getJson(decodeURIComponent(`p/${libPlugin.name.replace('/','.')}/v${libPlugin.version}/dist/lib-manifest.json`));
                if (libManifest) {
                  const libExportedDeps = Object.keys(libManifest.content);
                  // now check, if deps from this library plugin (from deps-manifest.json) are met on the libs-manifest.json.
                  // we strip the version here, because the version we have on deps-manifest.json comes from package.json,
                  // while the version from deployed plugins has nothing to do with the one in package.json
                  const currentDepsLibKey = depsLibsKeys.find(lib => lib.startsWith(libPlugin.name));  // e.g @ebay/muse-react
                  const currentDepsLibModules = depsManifest.content[currentDepsLibKey];
                  for (const exportedModule of currentDepsLibModules) {
                    if (!libExportedDeps.includes(exportedModule)) {
                      console.log(`WARNING: required module ${exportedModule} not found on library plugin ${libPlugin.name}@${libPlugin.version}`);
                    }
                  }
                }
              }
            }
          }
        },
      },
    },
  };