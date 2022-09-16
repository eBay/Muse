// boot plugin is used to load other plugins based on the app config
import museModules from '@ebay/muse-modules';
import loading from './loading';
import error from './error';
import registerSw from './registerSw';
import { loadInParallel, getPluginId } from './utils';
import msgEngine from './msgEngine';

import './style.css';

if (!window.MUSE_GLOBAL) {
  throw new Error('There must be global MUSE_GLOBAL object.');
}

loading.init();
async function start() {
  loading.showMessage('Starting...');

  const waitForLoaders = [];
  Object.assign(window.MUSE_GLOBAL, {
    msgEngine,
    loading,
    error,
    getUser: () => ({}),
    appEntries: [], // entries to start the app
    initEntries: [], // entries from init plugins
    pluginEntries: [], // entries from lib or normal plugins
    // Allow to register some func to wait for before starting the app
    waitFor: asyncFuncOrPromise => {
      waitForLoaders.push(asyncFuncOrPromise);
    },
    getPluginName: () => {
      if (!document.currentScript) {
        throw new Error(`You should only call MUSE_GLOBAL.getPluginName() during plugin load.`);
      }
      return document.currentScript.dataset.musePluginName;
    },
    // Muse shared modules global methods
    __shared__: {
      modules: {},
      register: museModules.register,
      require: museModules.require,
      parseMuseId: museModules.parseMuseId,
    },
  });

  const {
    app,
    cdn = '',
    entry = 'muse-react',
    initEntries,
    pluginEntries,
    appEntries,
    isDev = false,
    isE2eTest = false,
  } = window.MUSE_GLOBAL;
  let plugins = window.MUSE_GLOBAL.plugins || [];
  // TODO: remove below two lines after migrate old Muse plugins inside eBay
  registerSw();
  // Print app plugins in dev console
  const bootPlugin = plugins.find(p => p.type === 'boot');
  if (bootPlugin) {
    console.log(
      `Loading Muse app by ${bootPlugin.name}@${bootPlugin.version || bootPlugin.url}...`,
    );
  }

  // Load init plugins
  // Init plugins should be small and not depends on each other
  const initPluginUrls = plugins
    .filter(p => p.type === 'init')
    .map(p =>
      p.noUrl ? false : p.url || `${cdn}/p/${getPluginId(p.name)}/v${p.version}/dist/main.js`,
    )
    .filter(Boolean);

  // Load init plugins
  if (initPluginUrls.length > 0) {
    loading.showMessage(`Loading init plugins 1/${initPluginUrls.length}...`);
    await loadInParallel(initPluginUrls, loadedCount =>
      loading.showMessage(
        `Loading init plugins ${Math.min(loadedCount + 1, initPluginUrls.length)}/${
          initPluginUrls.length
        }...`,
      ),
    );
  }

  // Exec init entries
  if (initEntries.length > 0) {
    loading.showMessage(`Executing init entries...`);
    for (const initEntry of initEntries) {
      // Allow an init entry to break the start of the app
      if ((await initEntry.func()) === false) return;
    }
  }

  /* Handle forcePlugins query param */
  const searchParams = new URLSearchParams(window.location.search);
  const forcePluginStr = searchParams.get('forcePlugins');
  const previewer = searchParams.get('previewer');
  const loginUser = window.MUSE_GLOBAL.getUser()?.username;

  let specifiedPlugins = plugins;
  if (forcePluginStr && (isE2eTest || loginUser === previewer)) {
    const forcePluginById = forcePluginStr
      .split(';')
      .filter(Boolean)
      .reduce((p, c) => {
        const separator = '@';
        const limit = 2;
        let prefix = '';
        if (c.startsWith('@') && c[0] === separator) {
          // Starts with @, means it's a scoped plugin
          c = c.substring(1);
          prefix = '@';
        }
        const arr = c.split(separator, limit);
        if (arr.length === limit) {
          const [name, type] = arr[0].split('!');
          p[`${prefix}${name}`] = {
            version: arr[1],
            type: type,
          };
        }
        return p;
      }, {});
    // Update or remove plugins from the list based on forcePlugins
    specifiedPlugins = plugins
      .map(p => {
        if (!forcePluginById[p.name]) return p;
        const newPlugin = { ...p, version: forcePluginById[p.name].version };
        delete forcePluginById[p.name];
        return newPlugin;
      })
      .filter(p => p.version !== 'null');

    // Need to get the type of plugin from muse registry directly.
    for (const p in forcePluginById) {
      if (forcePluginById[p].version !== 'null') {
        specifiedPlugins.push({
          name: p,
          type: forcePluginById[p].type,
          version: forcePluginById[p].version,
        });
      }
    }
  }

  window.MUSE_CONFIG.plugins = window.MUSE_GLOBAL.plugins = plugins = specifiedPlugins;
  console.log(`Plugins(${plugins.length}):`);
  plugins.forEach(p =>
    console.log(`  * ${p.name}@${p.version || p.url}${p.noUrl ? ' (No Url)' : ''}`),
  );

  // Load normal and lib plugins
  const distDir = isE2eTest ? 'test' : 'dist';
  const pluginUrls = plugins
    .filter(p => p.type !== 'boot' && p.type !== 'init')
    .map(p =>
      p.noUrl
        ? false
        : p.url ||
          `${cdn}/p/${getPluginId(p.name)}/v${p.version}/${isDev ? 'dev' : distDir}/main.js`,
    )
    .filter(Boolean);

  // Load plugin bundles
  loading.showMessage(`Loading plugins 1/${pluginUrls.length}...`);
  await loadInParallel(pluginUrls, loadedCount =>
    loading.showMessage(
      `Loading plugins ${Math.min(loadedCount + 1, pluginUrls.length)}/${pluginUrls.length}...`,
    ),
  );

  // Exec plugin entries
  if (pluginEntries.length > 0) {
    loading.showMessage(`Executing plugin entries...`);
    pluginEntries.forEach(entry => entry.func());
  }

  // Wait for loader
  if (waitForLoaders.length > 0) {
    loading.showMessage(`Executing custom loaders ...`);
    // let loaderLoadedCount = 0;
    const arr = await Promise.all(
      waitForLoaders.map(async loader => {
        // Usually a plugin waitFor a promise so that it doesn't need to wait for all plugins loaded before executing
        if (loader.then) return await loader;
        // If pass an async function, it executes while all plugins are loaded.
        else return await loader();
      }),
    );
    // If a loader returns false, then don't continue starting
    if (arr.some(s => s === false)) return;
  }

  window.MUSE_GLOBAL.getAppVariables = () => {
    const appDefaultVars = window.MUSE_GLOBAL.app?.variables || {};
    const appCurrentEnvVars = window.MUSE_GLOBAL.env?.variables || {};
    const mergedAppVariables = {
      ...appDefaultVars,
      ...appCurrentEnvVars,
    };
    return mergedAppVariables;
  };

  window.MUSE_GLOBAL.getPluginVariables = pluginId => {
    // TODO: merge default vars with deployment vars (unless it's done on muse-express-middleware before)
    const pluginDeployedVars =
      window.MUSE_GLOBAL.plugins.find(p => p.name === pluginId)?.variables || {};

    return pluginDeployedVars;
  };

  // Start the application
  const entryName = app?.entry || '@ebay/muse-lib-react';
  const entryApp = appEntries.find(e => e.name === entryName);
  if (entryApp) {
    console.log(`Starting the app from ${entry}...`);
    loading.showMessage(`Starting the app...`);
    await entryApp.func();
  } else {
    error.show(`No app entry found: ${entryName}.`);
  }
  loading.hide();
}
const timeStart = Date.now();
start()
  .then(() => {
    const timeEnd = Date.now();
    console.log(`Muse app started in ${(timeEnd - timeStart) / 1000} seconds.`);
  })
  .catch(err => {
    console.log('Failed to start app.');
    err && console.error(err);
    loading.hide();
    if (err?.message) {
      error.show(err.message);
    }
  });
