// boot plugin is used to load other plugins based on the app config
import museModules from '@ebay/muse-modules';
import loading from './loading';
import { loadInParallel, getPluginId } from './utils';
import './style.css';

async function start() {
  loading.showMessage('Starting...');
  if (!window.MUSE_GLOBAL) {
    window.MUSE_GLOBAL = {};
  }
  window.MUSE_GLOBAL.loading = loading;
  const waitForLoaders = [];
  Object.assign(window.MUSE_GLOBAL, {
    appEntries: [], // entries to start the app
    initEntries: [], // entries from init plugins
    pluginEntries: [], // entries from lib or normal plugins
    // Allow to register some func to wait for before starting the app
    waitFor: asyncFuncOrPromise => {
      waitForLoaders.push(asyncFuncOrPromise);
    },
    __shared__: {
      modules: {},
      register: museModules.register,
      require: museModules.require,
      parseMuseId: museModules.parseMuseId,
    },
  });
  const {
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
  window.MUSE_GLOBAL.getUser = () => ({});

  // Print app plugins in dev console
  const bootPlugin = plugins.find(p => p.type === 'boot');
  if (!bootPlugin) {
    throw new Error('Boot plugin not found.');
  }

  console.log(`Loading Muse app by ${bootPlugin.name}@${bootPlugin.version || bootPlugin.url}...`);
  console.log(`Plugins(${plugins.length}):`);
  plugins.forEach(p => console.log(`  * ${p.name}@${p.version || p.url}`));

  // Load init plugins
  // Init plugins should be small and not depends on each other
  const initPluginUrls = plugins
    .filter(p => p.type === 'init')
    .map(
      p =>
        p.url || `${cdn}/p/${getPluginId(p.name)}/v${p.version}/${isDev ? 'dev' : 'dist'}/main.js`,
    );

  // Load init plugins
  loading.showMessage(`Loading init plugins 1/${initPluginUrls.length}...`);
  await loadInParallel(initPluginUrls, loadedCount =>
    loading.showMessage(
      `Loading init plugins ${Math.min(loadedCount + 1, initPluginUrls.length)}/${
        initPluginUrls.length
      }...`,
    ),
  );

  // Exec init entries
  console.log('Execution init entries...');
  for (const initEntry of initEntries) {
    // Allow an init entry to break the start of the app
    if ((await initEntry.func()) === false) return;
  }

  // Load plugins bundles
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
  console.log('Execution plugin entries...');
  pluginEntries.forEach(entry => entry.func());

  // Wait for loader
  loading.showMessage(`Custom loaders 1/${waitForLoaders.length}...`);

  let loaderLoadedCount = 0;
  const arr = await Promise.all(
    waitForLoaders.map(async loader => {
      // Usually a plugin waitFor a promise so that it doesn't need to wait for all plugins loaded before executing

      loading.showMessage(`Custom loaders ${++loaderLoadedCount}/${waitForLoaders.length}...`);
      if (loader.then) return await loader;
      // If pass an async function, it executes while all plugins are loaded.
      else return await loader();
    }),
  );
  // If a loader returns false, then don't continue starting
  if (arr.some(s => s === false)) return;

  // Start the application
  const entryApp = appEntries.find(e => e.name === entry);
  console.log(`Starting the app from ${entry}...`);
  loading.showMessage(`Starting...`);
  await entryApp.func();
  loading.hide();
}

loading.init();
start()
  .then(() => {
    console.log(`Muse app started.`);
  })
  .catch(err => {
    console.log('Failed to start app.');
    console.error(err);
  });
