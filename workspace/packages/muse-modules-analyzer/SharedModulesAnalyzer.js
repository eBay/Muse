const muse = require('@ebay/muse-core');
const fs = require('fs-extra');
const _ = require('lodash');
const { parseMuseId, findMuseModule } = require('@ebay/muse-modules');

const parseNameVersion = (nameVersion) => {
  const arr = _.compact(nameVersion.split(/@/));
  const name = '@' + arr[0];
  const version = arr[1];
  return { name, version };
};

const getLibManifest = async (pluginName, version, mode) => {
  const pid = muse.utils.getPluginId(pluginName);

  if (/\d+\.\d+\.\d+/.test(version)) {
    return (await muse.storage.assets.getJson(`/p/${pid}/v${version}/${mode}/lib-manifest.json`))
      .content;
  } else {
    //It's a local folder
    return fs.readJsonSync(`${version}/${mode}/lib-manifest.json`).content;
  }
};

/**
 * Analyze shared modules of lib plugins for scenarios:
 * 1. Verify when build a plugin, all depending shared modules are not included by itself.
 * 2. All required shared modules should exist on an app/env.
 * 3. Debug shared modules issue by comparing shared modules diff between two versions of a lib plugin.
 */
class SharedModulesAnalyzer {
  /**
   * Get difference of shared modules between two versions of a lib plugin
   * @param {string} pluginName - name of the lib plugin
   * @param {string} baseVersion - base version
   * @param {string} currentVersion - current version
   * @param {*} mode - dist, dev or test
   * @returns {{baseIds: string[], currentIds: string[], removedIds: string[], addedIds: string[], addedPkgs: {}, removedPkgs: {}, updatedPkgs: {}}}
   */
  async getLibDiff(pluginName, baseVersion, currentVersion, mode = 'dist') {
    const baseOne = await getLibManifest(pluginName, baseVersion, mode);
    const currentOne = await getLibManifest(pluginName, currentVersion, mode);

    const baseIds = _.keys(baseOne);
    const currentIds = _.keys(currentOne);
    const removedIds = _.differenceBy(baseIds, currentIds, (id) => {
      const { name, path } = parseMuseId(id);
      return name + '@' + path;
    });
    const addedIds = _.differenceBy(currentIds, baseIds, (id) => {
      const { name, path } = parseMuseId(id);
      return name + '@' + path;
    });

    const basePkgs = {};
    const currentPkgs = {};

    baseIds.forEach((id) => {
      const { name, version } = parseMuseId(id);
      basePkgs[name] = version.join('.');
    });

    currentIds.forEach((id) => {
      const { name, version } = parseMuseId(id);
      currentPkgs[name] = version.join('.');
    });

    const addedPkgs = {};
    const removedPkgs = {};
    const updatedPkgs = {};

    Object.keys(currentPkgs).forEach((name) => {
      if (!basePkgs[name]) {
        addedPkgs[name] = currentPkgs[name];
      } else if (basePkgs[name] !== currentPkgs[name]) {
        updatedPkgs[name] = {
          from: basePkgs[name],
          to: currentPkgs[name],
        };
      }
    });

    Object.keys(basePkgs).forEach((name) => {
      if (!currentPkgs[name]) {
        removedPkgs[name] = basePkgs[name];
      }
    });

    return {
      baseIds,
      currentIds,
      removedIds: removedIds.filter((id) => {
        const { name } = parseMuseId(id);
        if (name === pluginName) return false;
        return !removedPkgs[name];
      }),
      addedIds: addedIds.filter((id) => {
        const { name } = parseMuseId(id);
        if (name === pluginName) return false;
        return !addedPkgs[name];
      }),
      addedPkgs,
      removedPkgs,
      updatedPkgs,
    };
  }
  /**
   * Get detailed shared modules from a lib plugin
   * @param {*} pluginName
   * @param {*} version
   * @param {*} mode
   * @returns
   */
  async getLibs(pluginName, version, mode = 'dist') {
    const pid = muse.utils.getPluginId(pluginName);

    // This api caches result itself (when assetsCache is true).
    const libManifest = (
      await muse.storage.assets.getJson(`/p/${pid}/v${version}/${mode}/lib-manifest.json`)
    ).content;

    // Generate structure like this:
    // {
    //   packages: {
    //     '@ebay/muse-lib-react': {
    //       version: ['1.2.13'],
    //       modules: ['/src/Root.js', '/src/styles/index.less', ...],
    //     },
    //     ...
    //   },
    const packages = {};
    Object.keys(libManifest).forEach((key) => {
      const { name, version } = parseMuseId(key);
      if (!packages[name]) packages[name] = { version: [], modules: [] };
      const pkg = packages[name];
      const v = version.join('.');
      if (!pkg.version.includes(v)) pkg.version.push(v);
      pkg.modules.push(key.replace(name + '@' + v, ''));
    });
    return {
      pluginName: pluginName,
      packages,
      byId: libManifest,
    };
  }

  /**
   * Get version(s) of a pakcage in a lib plugins shared modules.
   *
   * @param {*} pluginName
   * @param {*} version
   * @param {*} pkgName
   * @param {*} mode
   * @returns
   */
  async getLibVersion(pluginName, version, pkgName, mode = 'dist') {
    const libs = await this.getLibs(pluginName, version, mode);
    return libs.packages[pkgName].version;
  }

  /**
   * Get duplicated shared modules of plugins.
   *
   * @param {*} plugins
   * @param {*} mode
   */
  async getDuplicatedLibs(plugins, mode = 'dist') {
    const pkgs = {};
    const allLibs = await Promise.all(
      plugins.map(async (p) => {
        return await this.getLibs(p.name, p.version, mode);
      }),
    );

    allLibs.forEach((lib) => {
      Object.entries(lib.packages).forEach(([name, { version }]) => {
        if (!pkgs[name]) pkgs[name] = [];
        pkgs[name].push({
          name: lib.pluginName,
          version,
        });
      });
    });

    for (const name in pkgs) {
      if (pkgs[name].length === 1) {
        delete pkgs[name];
      }
    }
    return pkgs;
  }

  /**
   * Get depeding shared modules of a plugin
   * @param {*} pluginName
   * @param {*} version
   * @param {*} mode
   * @returns
   */
  async getDeps(pluginName, version, mode = 'dist') {
    const pid = muse.utils.getPluginId(pluginName);
    // Allow deps-manifest not exist.
    const depsManifest =
      (await muse.storage.assets.getJson(`/p/${pid}/v${version}/${mode}/deps-manifest.json`))
        ?.content || {};
    const result = {};
    Object.entries(depsManifest).forEach(([libNameVersion, modules]) => {
      const { name, version } = parseNameVersion(libNameVersion);

      result[libNameVersion] = {
        name,
        version,
        modules,
      };
    });
    return result;
  }

  // Validate if all depending shared libs are included in the depending plugin, with the accurate version
  // This is usually used to validate the build tool is working correctly.
  async validatePlugin(pluginName, version, mode) {
    const modes = mode ? [mode] : ['dist', 'dev'];

    const result = {
      missingModules: [],
    };
    for (const mode of modes) {
      console.log('Validateing plugin', pluginName, version, mode);
      const deps = await this.getDeps(pluginName, version, mode);
      await Promise.all(
        Object.keys(deps).map(async (libNameVersion) => {
          const { name, version } = parseNameVersion(libNameVersion);
          // Get shared libs of the depending plugin
          const dependingLibs = deps[libNameVersion];
          const sharedLibs = await this.getLibs(name, version, mode);
          dependingLibs.forEach((lib) => {
            if (sharedLibs[lib] === undefined) {
              console.log(`Missing shared lib: ${lib} from ${libNameVersion}`);
              result.missingModules.push({
                lib,
                libNameVersion,
              });
            } else {
              // console.log(`Found shared lib: ${lib} from ${libNameVersion}`);
            }
          });
        }),
      );
    }
    return result;
  }

  /**
   * Validate if all plugins have all required shared modules.
   * @param {*} appName
   * @param {*} envName
   * @param {*} mode
   * @returns
   */
  async validateApp(appName, envName, mode) {
    // Use a tricky to validate all plugins on app by empty deployment.
    return await this.validateDeployment(appName, envName, [], mode);
  }

  /**
   * Verfies if deploying plugins are compatible with the current app:
   * required shared modules of deploying plugins should be included by existing lib plugins on the app.
   * @param {*} appName
   * @param {*} envName
   * @param {*} deployment - [{pluginName, version, type}]
   * @param {*} mode
   * @returns
   */
  async validateDeployment(appName, envName, deployment, mode) {
    const modes = mode ? [mode] : ['dist', 'dev', 'test'];
    const app = await muse.data.get(`muse.app.${appName}`);

    const returnValue = {};
    for (const mode of modes) {
      const pluginByName = _.keyBy(app.envs[envName].plugins, 'name');

      // Whether to validate all plugins on the app:
      //  1. Deployment is empty
      //  2. Deployment contains a lib plugin
      let validateAll = deployment.length === 0;

      // Generate new plugin list after deployment
      await Promise.all(
        deployment.map(async (d) => {
          const p = pluginByName[d.pluginName];
          if (p) {
            if (p.type === 'lib') {
              validateAll = true;
            }
            if (d.type === 'remove') {
              delete pluginByName[d.pluginName];
            } else {
              p.version = d.version;
            }
          } else {
            const pluginMeta = await muse.data.get(`muse.plugin.${d.pluginName}`);
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

      // All shared modules on the app/env
      const sharedModules = {};
      const allModules = {};
      await Promise.all(
        newPlugins.map(async (p) => {
          if (p.type === 'lib') {
            sharedModules[p.name] = await this.getLibs(p.name, p.version, mode);
            Object.entries(sharedModules[p.name].byId).forEach(([id, value]) => {
              if (!allModules[id]) allModules[id] = { id };
              allModules[id][p.name] = true;
            });
          }
        }),
      );

      const getSharedModuleInfo = (id) => {
        const result = {};

        Object.entries(sharedModules).forEach(
          ([
            name,
            {
              packages: {
                [name]: { version },
              },
              byId,
            },
          ]) => {
            if (byId[id]) {
              // result[name] = byId[id];
              result.pkgName = name;
              result.pkgVersion = version[0];
              result.id = id;
            }
          },
        );
        return _.isEmpty(result) ? null : result;
      };

      // Which plugins to validate
      const pluginsToValidate = validateAll
        ? newPlugins.map((p) => p.name)
        : deployment.map((d) => d.pluginName);

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
            const deps = await this.getDeps(p.name, p.version, mode);
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
                      fromLibPlugin: sharedModuleInfo.pkgName,
                      fromLibVersion: sharedModuleInfo.pkgVersion,
                      requiredModuleId: id,
                      actualModuleId: foundModule.id,
                    });
                  } else {
                    result.foundModules.push({
                      pluginName: p.name,
                      pluginVersion: p.version,
                      fromLibPlugin: sharedModuleInfo.pkgName,
                      fromLibVersion: sharedModuleInfo.pkgVersion,
                      moduleId: id,
                    });
                  }

                  if (sharedModuleInfo.pkgName !== name) {
                    // Means the shared module is provided by another lib plugin
                    result.changedModules.push({
                      pluginName: p.name,
                      pluginVersion: p.version,
                      newLibPlugin: sharedModuleInfo.pkgName,
                      newLibVersion: sharedModuleInfo.pkgVersion,
                      oldLibPlugin: name,
                      oldLibVersion: version,
                      requiredModuleId: id,
                      actualModuleId: foundModule.id,
                    });
                  }
                } else {
                  result.missingModules.push({
                    pluginName: p.name,
                    pluginVersion: p.version,
                    plugin: `${p.name}@${p.version}`,
                    moduleId: id,
                  });
                }
              });
            });
          }
        }),
      );
      returnValue[mode] = result;
    }
    return returnValue;
  }
}

module.exports = SharedModulesAnalyzer;
