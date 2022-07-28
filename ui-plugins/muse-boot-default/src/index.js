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
    plugins = [],
    entry = 'muse-react',
    initEntries,
    pluginEntries,
    appEntries,
    isDev = false,
  } = window.MUSE_GLOBAL;
  window.MUSE_CONFIG = window.MUSE_GLOBAL;
  // TODO: remove below two lines after migrate old Muse plugins inside eBay
  registerSw();

  // Print app plugins in dev console
  const bootPlugin = plugins.find(p => p.type === 'boot');
  if (bootPlugin) {
    console.log(
      `Loading Muse app by ${bootPlugin.name}@${bootPlugin.version || bootPlugin.url}...`,
    );
  }
  console.log(`Plugins(${plugins.length}):`);
  plugins.forEach(p => console.log(`  * ${p.name}@${p.version || p.url}`));

  // Load init plugins
  // Init plugins should be small and not depends on each other
  const initPluginUrls = plugins
    .filter(p => p.type === 'init')
    .map(p => p.url || `${cdn}/p/${getPluginId(p.name)}/v${p.version}/dist/main.js`);

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

  // Load normal and lib plugins
  const pluginUrls = plugins
    .filter(p => p.type !== 'boot' && p.type !== 'init')
    .map(
      p =>
        p.url || `${cdn}/p/${getPluginId(p.name)}/v${p.version}/${isDev ? 'dev' : 'dist'}/main.js`,
    );

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

  // Start the application
  const entryApp = appEntries.find(e => e.name === entry);
  if (entryApp) {
    console.log(`Starting the app from ${entry}...`);
    loading.showMessage(`Starting the app...`);
    await entryApp.func();
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
