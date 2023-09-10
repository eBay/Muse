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

class SharedModulesAnalyzer {
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
  // Get detailed shared modules from a lib plugin
  async getSharedModules(pluginName, version, mode = 'dist') {
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
    //       children: ['/src/Root.js', '/src/styles/index.less', ...],
    //     },
    //     ...
    //   },
    const packages = {};
    Object.keys(libManifest).forEach((key) => {
      const { name, version } = parseMuseId(key);
      if (!packages[name]) packages[name] = { version: [], children: [] };
      const pkg = packages[name];
      const v = version.join('.');
      if (!pkg.version.includes(v)) pkg.version.push(v);
      pkg.children.push(key.replace(name + '@' + v, ''));
    });
    return {
      packages,
      byId: libManifest,
    };
  }

  async getLibDeps(pluginName, version, mode = 'dist') {
    const pid = muse.utils.getPluginId(pluginName);
    try {
      const depsManifest = (
        await muse.storage.assets.getJson(`/p/${pid}/v${version}/${mode}/deps-manifest.json`)
      ).content;
      const result = {};
      Object.entries(depsManifest).forEach(([libNameVersion, children]) => {
        const { name, version } = parseNameVersion(libNameVersion);

        result[libNameVersion] = {
          name,
          version,
          children,
        };
      });
      return result;
    } catch (e) {
      // Allow deps-manifest not exist.
      return {};
    }
  }

  // Verify if all depending shared libs are included in the depending plugin, with the accurate version
  // This is usually used to verify the build tool is working correctly.
  async verifyPlugin(pluginName, version, mode) {
    const modes = mode ? [mode] : ['dist', 'dev'];

    for (const mode of modes) {
      console.log('Verifying plugin', pluginName, version, mode);
      const deps = await this.getLibDeps(pluginName, version, mode);
      await Promise.all(
        Object.keys(deps).map(async (libNameVersion) => {
          const { name, version } = parseNameVersion(libNameVersion);
          // Get shared libs of the depending plugin
          const dependingLibs = deps[libNameVersion];
          const sharedLibs = await this.getSharedModules(name, version, mode);
          dependingLibs.forEach((lib) => {
            if (sharedLibs[lib] === undefined) {
              console.log(`Missing shared lib: ${lib} from ${libNameVersion}`);
            } else {
              console.log(`Found shared lib: ${lib} from ${libNameVersion}`);
            }
          });
        }),
      );
    }
  }

  async verifyApp(appName, envName, mode) {}

  // Verfies if deploying plugins are compatible with the current app:
  // required shared modules of deploying plugins should be included by existing lib plugins on the app.
  async verifyDeployment(appName, envName, deployment, mode) {
    const modes = mode ? [mode] : ['dist', 'dev'];
    const app = await muse.data.get(`muse.app.${appName}`);

    for (const mode of modes) {
      const pluginByName = _.keyBy(app.envs[envName].plugins, 'name');

      // If some lib plugin is removed, need to check all plugins
      let isLibChanged = false;
      await Promise.all(
        deployment.map(async (d) => {
          const p = pluginByName[d.pluginName];
          if (p) {
            if (p.type === 'lib') {
              isLibChanged = true;
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
      const moduleById = {};
      await Promise.all(
        newPlugins.map(async (p) => {
          if (p.type === 'lib') {
            sharedModules[p.name] = await this.getSharedModules(p.name, p.version, mode);
            Object.entries(sharedModules[p.name].byId).forEach(([id, value]) => {
              moduleById[id] = value;
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

      // Which plugins to verify
      const pluginsToVerify = isLibChanged
        ? newPlugins.map((p) => p.name)
        : deployment.map((d) => d.pluginName);

      const result = {
        foundModules: [],
        missingModules: [],
        updatedModules: [],
        changedModules: [], // changed from one pakcage to another
      };
      await Promise.all(
        pluginsToVerify.map(async (pluginName) => {
          const p = pluginByName[pluginName];
          // No need to verify boot and init plugins
          if (!p.type || p.type === 'lib' || p.type === 'normal') {
            // deps: { libPlugin@version: { name, version, children: [] } }
            const deps = await this.getLibDeps(p.name, p.version, mode);
            Object.values(deps).forEach(({ name, version, children }) => {
              children.forEach((id) => {
                // If the module is found in shared modules
                const foundModule = findMuseModule(id, { modules: moduleById });

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

      return result;
    }
  }
}

module.exports = SharedModulesAnalyzer;
