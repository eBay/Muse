const express = require('express');
const path = require('path');
// This is the only place needs muse-core
const muse = require('@ebay/muse-core');
const _ = require('lodash');
const museAssetsMiddleware = require('@ebay/muse-express-middleware/lib/assets');
const museAppMiddleware = require('@ebay/muse-express-middleware/lib/app');
const { getMuseLibs, getLocalPlugins, getPkgJson } = require('./utils');

// The plugin defined by a remote url could be below pattern:
// http://localhost:3030/main.js
// plugin-name#type:http://localhost:3030/main.js
// #type:http://localhost:3030/main.js
const getPluginByUrl = s => {
  if (s.startsWith('http://') || s.startsWith('https://')) {
    return {
      name: s,
      url: s,
      type: 'normal',
    };
  }
  // TODO: validate string pattern
  const arr = s.split(':');
  const nameArr = arr[0].split(/[#!]/g);
  const url = arr.slice(1).join(':');

  return {
    name: nameArr[0] || url,
    type: nameArr[1] || 'normal',
    url,
  };
};

muse.plugin.register({
  name: 'muse-plugin-webpack-dev-server',
  museMiddleware: {
    app: {
      getAppInfo: () => {
        // Refresh .env value
        require('dotenv').config({ override: true });
        const museConfig = getPkgJson()?.muse;
        if (!museConfig?.devConfig) {
          throw new Error(`muse.devConfig section is not found in package.json.`);
        }
        const { app: appName, env: envName = 'staging' } = museConfig.devConfig;
        return { appName, envName };
      },
      processAppInfo: ({ app, env }) => {
        const {
          appOverride, // override app config from registry
          envOverride, // override env config from registry
        } = getPkgJson().muse.devConfig;

        Object.assign(app, appOverride);
        Object.assign(env, envOverride);
        const plugins = env.plugins;
        const pkgJson = getPkgJson();

        const museConfig = pkgJson.muse;
        // Handle remote plugins defined in package.json or .env
        const remotePlugins = _.castArray(museConfig?.devConfig?.remotePlugins || []);
        if (process.env.MUSE_REMOTE_PLUGINS) {
          remotePlugins.push(...process.env.MUSE_REMOTE_PLUGINS.split(';').map(s => _.trim(s)));
        }

        // if a plugin is defined by url like plugin-name#type:http://localhost:3030/main.js then it's loaded as a plugin
        // it could come from remotePlugins or MUSE_REMOTE_PLUGINS
        const urlPlugins = remotePlugins
          .filter(s => /:https?:/.test(s)) // for remote plugin loaded by url, should not compile it
          .map(getPluginByUrl);

        const localNames = [pkgJson.name];
        const localPlugins = getLocalPlugins();
        localNames.push(...localPlugins.map(p => p.name));

        let realPluginsToLoad = [
          ...plugins.filter(
            // boot/init plugin is always loaded for an app
            p =>
              p.core ||
              p.type === 'boot' ||
              p.type === 'init' ||
              remotePlugins.includes('*') ||
              remotePlugins.includes(p.name) ||
              localNames.includes(p.name) ||
              urlPlugins.map(up => up.name).includes(p.name),
          ),
        ];

        const pluginByName = _.keyBy(plugins, 'name');
        localNames.forEach(name => {
          // For a local included plugin, the bundle is from local bundle
          // Keep original plugin meta for configurations data
          if (pluginByName[name]) pluginByName[name].noUrl = true;
        });

        // // if a plugin is defined by url, then it has higher priority than deployed ones
        // // so filter out deployed plugins
        // realPluginsToLoad = realPluginsToLoad.filter(
        //   p => !urlPlugins.some(up => up.name === p.name),
        // );
        // realPluginsToLoad.push(...urlPlugins);

        // // Exclude local plugins from deployed plugins
        // realPluginsToLoad = realPluginsToLoad.filter(p => !localNames.includes(p.name));
        const isBoot = museConfig.type === 'boot';
        if (isBoot) {
          // For a boot plugin project, it doesn't use the deployed boot plugin
          // realPluginsToLoad = realPluginsToLoad.filter(p => p.type !== 'boot');
          const deployedBoot = realPluginsToLoad.find(p => p.name === pkgJson.name);
          if (deployedBoot) {
            deployedBoot.dev = true;
            deployedBoot.url = '/boot.js';
          } else {
            realPluginsToLoad.unshift({
              name: pkgJson.name,
              dev: true,
              type: 'boot',
              url: '/boot.js',
            });
          }
        } else {
          // boot plugin is loaded directly by Muse app middleware
          // here define the dev bundle as a plugin loaded by url
          // This support also support init plugins
          realPluginsToLoad.push({
            // Show plugin name in browser console
            name: 'local:' + localNames.join(','),
            type: museConfig.type || 'normal',
            url: '/main.js',
            dev: true,
          });

          // If plugins are installed locally, use the local version and url
          // NOTE: Boot plugin should not depends on libs
          getMuseLibs().forEach(libName => {
            // Exclude remote lib plugin if it's installed locally
            const localP = {
              name: libName,
              version: require(libName + '/package.json').version,
              url: `/muse-assets/local/p/${muse.utils.getPluginId(libName)}/dev/main.js`,
            };
            const p = realPluginsToLoad.find(p => p.name === libName);
            if (p) {
              Object.assign(p, localP);
            } else {
              realPluginsToLoad.push(localP);
            }
          });
        }
        plugins.length = 0;
        plugins.push(...realPluginsToLoad);

        // For a plugin included by url, keep the original meta too
        urlPlugins.forEach(up => {
          if (pluginByName[up.name]) pluginByName[up.name].url = up.url;
          else plugins.push(up);
        });
      },
      processMuseGlobal: museGlobal => {
        museGlobal.isLocal = true;
      },
    },
  },
});

module.exports = middlewares => {
  // Serve local muse libs resources
  const localLibMiddlewares = getMuseLibs().map(libName => {
    const id = muse.utils.getPluginId(libName);
    const pkgJsonPath = require.resolve(libName + '/package.json');
    const pkgDir = pkgJsonPath.replace(/package\.json$/, '');
    return {
      name: `muse-local-static-${libName}`,
      path: `/muse-assets/local/p/${id}`,
      middleware: express.static(path.join(pkgDir, 'build')),
    };
  });
  try {
    // It doesn't need history fallback since Muse app middleware handles it.
    const i = _.findIndex(middlewares, m => m.name === 'webpack-dev-middleware');

    if (i < 0) {
      throw new Error('Can not find webpack-dev-middleware.');
    }
    middlewares.splice(
      i + 1,
      0,
      ...localLibMiddlewares,
      // Local Muse assets server to improve local dev performance
      // Because Muse assets middleware caches resource in local cache folder.
      museAssetsMiddleware({ basePath: '/muse-assets' }),
      // Serve app, it will use the plugin to provide app info
      museAppMiddleware({ cdn: '/muse-assets', isDev: true }),
    );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  return middlewares;
};
