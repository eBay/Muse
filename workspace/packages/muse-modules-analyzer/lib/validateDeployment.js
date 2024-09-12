const _ = require('lodash');
const muse = require('@ebay/muse-core');
const checkReleseVersion = require('@ebay/muse-core/lib/pm/checkReleaseVersion');
const { findMuseModule } = require('@ebay/muse-modules');
const getLibs = require('./getLibs');
const getDeps = require('./getDeps');

/**
 * Verfies if deploying plugins are compatible with the current app:
 * required shared modules of deploying plugins should be included by existing lib plugins on the app.
 * @param {*} appName
 * @param {*} envName
 * @param {*} deployment - [{pluginName, version, type: 'add|remove'}]
 * @param {*} mode
 * @returns
 */
async function validateDeployment(appName, envName, deployment, mode) {
  if (typeof appName === 'object') {
    ({ appName, envName, deployment, mode } = appName);
  }
  const modes = mode ? [mode] : ['dist', 'dev', 'test'];
  const app = await muse.data.get(`muse.app.${appName}`);
  const pluginByName = _.keyBy(app.envs[envName].plugins, 'name');

  // Whether to validate all plugins on the app:
  //  1. Deployment is empty
  //  2. Deployment contains a lib plugin
  let validateAll = deployment.length === 0;

  // Generate new plugin list after deployment
  await Promise.all(
    deployment.map(async (d) => {
      d.version = (
        await checkReleseVersion({
          pluginName: d.pluginName,
          version: d.version,
        })
      ).version;
      const p = pluginByName[d.pluginName];

      // If undeploy a plugin not on the app/env, ignore it.
      if (d.type === 'remove' && !pluginByName[d.pluginName]) {
        return;
      }
      if (p) {
        if (p.type === 'lib') {
          // Validate all plugins if a lib plugin is added/updated
          validateAll = true;
        }
        if (d.type === 'remove') {
          delete pluginByName[d.pluginName];
        } else {
          p.version = d.version;
        }
      } else {
        const pluginMeta = await muse.data.get(`muse.plugin.${d.pluginName}`);
        if (pluginMeta.type === 'lib') {
          validateAll = true;
        }
        pluginByName[d.pluginName] = {
          name: d.pluginName,
          version: d.version,
          type: pluginMeta.type,
        };
      }
    }),
  );
  // New plugins after deployment on the env
  const newPlugins = Object.values(pluginByName);

  const returnValue = {
    multipleBootPlugins: false,
    missingBootPlugin: false,
  };
  await Promise.all(
    modes.map(async (mode) => {
      // for (const mode of modes) {

      // All shared modules on the app/env
      const sharedModules = {};
      const allModules = {};
      await Promise.all(
        newPlugins.map(async (p) => {
          if (p.type === 'lib') {
            sharedModules[p.name] = await getLibs(p.name, p.version, mode);
            Object.keys(sharedModules[p.name].byId).forEach((id) => {
              if (!allModules[id]) allModules[id] = { id };
              allModules[id][p.name] = true;
            });
          }
        }),
      );

      // Get the shared module info, from which lib plugin
      const getSharedModuleInfo = (id) => {
        const result = {};

        Object.entries(sharedModules).forEach(([name, { byId, version }]) => {
          if (byId[id]) {
            result.libPluginName = name;
            result.libPluginVersion = version;
          }
        });
        return _.isEmpty(result) ? null : result;
      };

      // Which plugins to validate
      const pluginsToValidate = validateAll
        ? newPlugins.map((p) => p.name)
        : deployment.filter((d) => d.type !== 'remove').map((d) => d.pluginName);

      const result = {
        foundModules: [], // found in shared modules
        missingModules: [], // required by some plugins but not found
        updatedModules: [], // changed from one version to another
        changedModules: [], // changed from one pakcage to another
      };

      await Promise.all(
        pluginsToValidate.map(async (pluginName) => {
          const p = pluginByName[pluginName];
          // No need to validate boot and init plugins
          if (!p.type || p.type === 'lib' || p.type === 'normal') {
            // deps: { libPlugin@version: { name, version, modules: [] } }
            const deps = await getDeps(p.name, p.version, mode);
            Object.values(deps).forEach(({ name, version, modules }) => {
              modules.forEach((id) => {
                // If the module is found in shared modules
                const foundModule = findMuseModule(id, { modules: allModules });

                if (foundModule) {
                  // Shared module info means which lib plugin/version provides it
                  // It should be able to always find the shared module info
                  const sharedModuleInfo = getSharedModuleInfo(foundModule.id);

                  if (id !== foundModule.id) {
                    // Module found but the id is changed, means the package version is changed:
                    result.updatedModules.push({
                      pluginName: p.name,
                      pluginVersion: p.version,
                      fromLibPlugin: sharedModuleInfo.libPluginName,
                      fromLibVersion: sharedModuleInfo.libPluginVersion,
                      requiredModuleId: id,
                      gotModuleId: foundModule.id,
                    });
                  }

                  if (sharedModuleInfo.libPluginName !== name) {
                    // Means the shared module is provided by another lib plugin
                    result.changedModules.push({
                      pluginName: p.name,
                      pluginVersion: p.version,
                      newLibPlugin: sharedModuleInfo.libPluginName,
                      newLibVersion: sharedModuleInfo.libPluginVersion,
                      oldLibPlugin: name,
                      oldLibVersion: version,
                      requiredModuleId: id,
                      gotModuleId: foundModule.id,
                    });
                  }
                } else {
                  result.missingModules.push({
                    plugin: p.name,
                    version: p.version,
                    sharedFrom: `${name}@${version}`,
                    moduleId: id,
                  });
                }
              });
            });
          }
        }),
      );

      returnValue[mode] = result;
    }),
  );

  const bootPlugins = Object.values(pluginByName).filter((p) => p.type === 'boot');
  // If no boot plugin
  returnValue.missingBootPlugin = bootPlugins.length === 0;
  // If there're multiple boot plugins
  if (bootPlugins.length > 1) {
    returnValue.multipleBootPlugins = bootPlugins.map((p) => p.name);
  }

  // Overall validation result
  returnValue.success =
    returnValue.missingBootPlugin === false &&
    returnValue.multipleBootPlugins === false &&
    modes.every((mode) => returnValue[mode].missingModules.length === 0);

  return returnValue;
}

module.exports = validateDeployment;
