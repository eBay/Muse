const muse = require('@ebay/muse-core');
const _ = require('lodash');
const { parseMuseId } = require('@ebay/muse-modules');

class SharedModulesAnalyzer {
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
      byKey: libManifest,
    };
  }

  async getLibDeps(pluginName, version, mode = 'dist') {
    const pid = muse.utils.getPluginId(pluginName);
    const libManifest = (
      await muse.storage.assets.getJson(`/p/${pid}/v${version}/${mode}/deps-manifest.json`)
    ).content;
    console.log(libManifest);
    const result = {};
    Object.entries(libManifest).forEach(([name, children]) => {
      const arr = _.compact(name.split(/@/));
      const pkgName = '@' + arr[0];
      const version = arr[1];
      result[name] = {
        name: pkgName,
        version,
        children,
      };
    });
    return result;
  }

  // Verify if all depending shared libs are included in the depending plugin, with the accurate version
  async verifyPlugin(pluginName, version, mode) {
    const modes = mode ? [mode] : ['dist', 'dev'];

    for (const mode of modes) {
      console.log('Verifying plugin', pluginName, version, mode);
      const deps = await this.getLibDeps(pluginName, version, mode);
      await Promise.all(
        Object.keys(deps).map(async (libNameVersion) => {
          const arr = _.compact(libNameVersion.split(/@/));
          const name = '@' + arr[0];
          const version = arr[1];
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
      const sharedModules = {};

      const pluginByName = _.keyBy(app.envs[envName].plugins, 'name');
      await Promise.all(
        app.envs[envName].plugins.map(async (p) => {
          if (p.type === 'lib') {
            sharedModules[p.name] = await this.getSharedModules(p.name, p.version, mode);
          }
        }),
      );

      console.log('mode', sharedModules);
    }
  }
}

module.exports = SharedModulesAnalyzer;
