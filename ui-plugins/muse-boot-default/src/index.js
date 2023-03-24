// boot plugin is used to load other plugins based on the app config
import museModules from '@ebay/muse-modules';
import loading from './loading';
import error from './error';
import registerSw from './registerSw';
import { loadInParallel, getPluginId } from './utils';
import msgEngine from './msgEngine';
import './urlListener';

import './style.css';
const mg = window.MUSE_GLOBAL;

if (!mg) {
  throw new Error('There must be global MUSE_GLOBAL object.');
}

loading.init();
async function start() {
  loading.showMessage('Starting...');
  const waitForLoaders = [];

  // Get the config from both app and env
  // That is, app.config is the default, env.config can override any value on app.config
  const appConfig = Object.assign({}, mg.app?.config);
  Object.entries(mg.env?.config).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      appConfig[key] = value;
    }
  });

  Object.assign(mg, {
    appConfig,
    msgEngine,
    loading,
    error,
    // isSubApp: window.parent !== window,
    getUser: () => null,
    appEntries: [], // entries to start the app
    initEntries: [], // entries from init plugins
    pluginEntries: [], // entries from lib or normal plugins
    // Allow to register some func to wait for before starting the app
    waitFor: (asyncFuncOrPromise) => {
      waitForLoaders.push(asyncFuncOrPromise);
    },
    getPluginName: () => {
      if (!document.currentScript) {
        throw new Error(`You should only call MUSE_GLOBAL.getPluginName() during plugin load.`);
      }
      return document.currentScript.dataset.musePluginName;
    },
    getAppVariables: () => {
      const appDefaultVars = mg.app?.variables || {};
      const appCurrentEnvVars = mg.env?.variables || {};
      const mergedAppVariables = {
        ...appDefaultVars,
        ...appCurrentEnvVars,
      };
      return mergedAppVariables;
    },
    getPluginVariables: (pluginName) => {
      const pluginDefaultVars = mg.app?.pluginVariables?.[pluginName] || {};
      const pluginCurrentEnvVars = mg.env?.pluginVariables?.[pluginName] || {};
      const mergedPluginVariables = {
        ...pluginDefaultVars,
        ...pluginCurrentEnvVars,
      };
      return mergedPluginVariables;
    },
    // TODO: get plugin assets public paths (assets in public folder)
    getPublicPath: (pluginName, assetPath) => {
      if (!assetPath) throw new Error('assetPath is required for getPublicPath method.');
      assetPath = assetPath.replace(/^\/*/, '');
      const pluginId = getPluginId(pluginName);

      if (mg.isDev) {
        // for dev, check if there's local plugins
        const names = mg.plugins.find((p) => !!p.localPlugins)?.localPlugins;
        if (names && names.includes(pluginName)) {
          return `/muse-assets/local/p/${pluginId}/${assetPath}`;
        }
      }
      const currentPlugin = window.MUSE_GLOBAL.plugins?.find((p) => p.name === pluginName);
      if (!currentPlugin) return;
      const { version } = currentPlugin || {};
      let publicPath = `${window.MUSE_GLOBAL.cdn}/p/${pluginId}/${version}`;
      if (window.MUSE_GLOBAL.isDev || window.MUSE_GLOBAL.isLocal) {
        publicPath = publicPath + `/dev/${assetPath}`;
      } else {
        publicPath = publicPath + `/dist/${assetPath}`;
      }
      return publicPath;
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
    initEntries,
    pluginEntries,
    appEntries,
    isDev = false,
    isE2eTest = false,
  } = mg;
  let { plugins = [] } = window.MUSE_GLOBAL;

  // MUSE_CONFIG is for backward compatability
  window.MUSE_CONFIG = mg;

  msgEngine.sendToParent({
    type: 'app-state-change',
    state: 'app-starting',
    // url: document.location.href,
  });

  registerSw();

  // Print app plugins in dev console
  const bootPlugin = plugins.find((p) => p.type === 'boot');
  if (bootPlugin) {
    console.log(
      `Loading Muse app by ${bootPlugin.name}@${bootPlugin.version || bootPlugin.url}...`,
    );
  }

  /* Handle forcePlugins query parameter */
  const searchParams = new URLSearchParams(window.location.search);
  const forcePluginStr = searchParams.get('forcePlugins');
  const previewClientCode = searchParams.get('clientCode');
  const localClientCode = mg.museClientCode;
  if (forcePluginStr && (isE2eTest || previewClientCode === localClientCode)) {
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
    plugins = plugins
      .map((p) => {
        if (!forcePluginById[p.name]) return p;
        const newPlugin = { ...p, version: forcePluginById[p.name].version };
        delete forcePluginById[p.name];
        return newPlugin;
      })
      .filter((p) => p.version !== 'null');

    // Need to get the type of plugin from muse registry directly.
    for (const p in forcePluginById) {
      if (forcePluginById[p].version !== 'null') {
        plugins.push({
          name: p,
          type: forcePluginById[p].type,
          version: forcePluginById[p].version,
        });
      }
    }
  } else {
    console.warn(`ClientCode is invalid.`);
  }
  console.log(`Plugins(${plugins.length}):`);
  // If a plugin has isLocal, it means its bundle is loaded somewhere else.
  // The registered plugin item is used to provide configurations. e.g plugin variables.
  plugins.forEach((p) =>
    console.log(
      `  * ${p.name}@${p.version || 'local'}${p.url ? ' (' + p.url + ') ' : ''}${
        p.isLocal ? ' (Local)' : ''
      }`,
    ),
  );
  msgEngine.sendToParent({
    type: 'app-state-change',
    state: 'app-loading',
    // url: document.location.href,
  });
  // Load init plugins
  // Init plugins should be small and not depend on each other
  const initPluginUrls = plugins
    .filter((p) => p.type === 'init')
    .map((p) =>
      p.isLocal ? false : p.url || `${cdn}/p/${getPluginId(p.name)}/v${p.version}/dist/main.js`,
    )
    .filter(Boolean);

  // Load init plugins
  if (initPluginUrls.length > 0) {
    loading.showMessage(`Loading init plugins 1/${initPluginUrls.length}...`);
    await loadInParallel(initPluginUrls, (loadedCount) =>
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

  // NOTE: init plugins have the opportunity to modify plugins list.
  // It's an expected behavior for some permission control.

  // Load normal and lib plugins
  const bundleDir = isDev ? 'dev' : isE2eTest ? 'test' : 'dist';
  const pluginUrls = plugins
    .filter((p) => p.type !== 'boot' && p.type !== 'init')
    .map((p) =>
      p.isLocal
        ? false
        : p.url || `${cdn}/p/${getPluginId(p.name)}/v${p.version}/${bundleDir}/main.js`,
    )
    .filter(Boolean);

  // Load plugin bundles
  loading.showMessage(`Loading plugins 1/${pluginUrls.length}...`);
  await loadInParallel(pluginUrls, (loadedCount) =>
    loading.showMessage(
      `Loading plugins ${Math.min(loadedCount + 1, pluginUrls.length)}/${pluginUrls.length}...`,
    ),
  );

  // Exec plugin entries
  // This ensures a fixed order for plugins to initialize
  if (pluginEntries.length > 0) {
    loading.showMessage(`Executing plugin entries...`);
    pluginEntries.forEach((entry) => entry.func());
  }

  // Wait for loader
  if (waitForLoaders.length > 0) {
    loading.showMessage(`Executing custom loaders ...`);
    // let loaderLoadedCount = 0;
    const arr = await Promise.all(
      waitForLoaders.map(async (loader) => {
        // Usually a plugin waitFor a promise so that it doesn't need to wait for all plugins loaded before executing
        if (loader.then) return await loader;
        // If pass an async function, it executes while all plugins are loaded.
        else return await loader();
      }),
    );
    // If a loader returns false, then don't continue starting
    // NOTE: if a loader needs to show an error message, just throw an error.
    if (arr.some((s) => s === false)) return;
  }

  // Start the application
  let entryName = appConfig.entry;
  if (!entryName) {
    // If there isn't entry defined and there's only one app entry from the plugins list.
    // Then just use the only one.
    if (appEntries.length === 1) {
      entryName = appEntries[0].name;
    } else if (appEntries.length === 0) {
      throw new Error(
        'No app entry found. You need a plugin deployed to the app to provide an app entry.',
      );
    } else {
      throw new Error(
        `Multiple entries found: ${appEntries
          .map((e) => e.name)
          .join(', ')}. You need to specify one entry in app config.`,
      );
    }
  }
  const entryApp = appEntries.find((e) => e.name === entryName);
  if (entryApp) {
    console.log(`Starting the app from ${entryName}...`);
    loading.showMessage(`Starting the app...`);
    await entryApp.func();
  } else {
    throw new Error(`The specified app entry was not found: ${entryName}.`);
  }
  loading.hide();
}
const timeStart = Date.now();
start()
  .then(() => {
    const timeEnd = Date.now();
    msgEngine.sendToParent({
      type: 'app-state-change',
      state: 'app-loaded',
      // url: document.location.href,
    });
    console.log(`Muse app started in ${(timeEnd - timeStart) / 1000} seconds.`);
  })
  .catch((err) => {
    console.log('Failed to start app.');
    err && console.error(err);
    loading.hide();
    if (err?.message) {
      error.showMessage(err.message);
    }
    msgEngine.sendToParent({
      type: 'app-state-change',
      state: 'app-failed',
      // url: document.location.href,
    });
  });
