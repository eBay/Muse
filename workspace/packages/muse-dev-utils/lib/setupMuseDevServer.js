const express = require('express');
const path = require('path');
const fs = require('fs-extra');
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
const getPluginByUrl = (s) => {
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
    esModule: url.includes('/src/'), // TODO: this is a tempory check for esmodule plugin
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
        const { app: appName = undefined, env: envName = 'staging' } = museConfig.devConfig;
        return { appName, envName };
      },
      processAppInfo: ({ app, env }) => {
        const {
          appOverride, // override app config from registry
          // envOverride, // override env config from registry - NOT USED SO FAR
          pluginsOverride,
        } = getPkgJson().muse.devConfig;

        // special treatment:  appOverride.variables will be set under "env" level, so that they get the highest priority for merging on local DEV.
        if (appOverride?.variables) {
          if (!env.variables) {
            env.variables = {};
          }
          for (const appVariableOverride of Object.keys(appOverride.variables)) {
            env.variables[appVariableOverride] = appOverride.variables[appVariableOverride];
          }
        }

        // merge rest of appOverride settings, if any, excluding the variables section (which has been added under env object)
        if (appOverride) {
          const appStrippedConfig = _.omit(appOverride, ['variables']);
          Object.assign(app, appStrippedConfig);
        }

        // assign the pluginsOverride "variables" to the correct internal config inside env.
        // we have to do it var by var, to avoid removing non-overriden variables
        if (pluginsOverride) {
          if (!env.pluginVariables) {
            env.pluginVariables = {};
          }
          for (const pluginOverride of Object.keys(pluginsOverride)) {
            if (
              !env.pluginVariables[pluginOverride] &&
              pluginsOverride[pluginOverride]?.variables
            ) {
              // initialize pluginVariables only if it's not setup yet AND we have actual variables to override
              env.pluginVariables[pluginOverride] = {};
            }
            if (pluginsOverride[pluginOverride]?.variables) {
              for (const varOverride of Object.keys(pluginsOverride[pluginOverride].variables)) {
                env.pluginVariables[pluginOverride][varOverride] =
                  pluginsOverride[pluginOverride].variables[varOverride];
              }
            }
          }
        }

        const plugins = env.plugins;

        // for rest of pluginsOverride, we have to remove the "variables" section of each plugin, and then merge the stripped object with env.plugins
        if (pluginsOverride) {
          for (const pluginOverride of Object.keys(pluginsOverride)) {
            const pluginStrippedConfig = _.omit(pluginsOverride[pluginOverride], ['variables']);
            const pluginIndex = plugins.findIndex((pl) => pl.name === pluginOverride);
            if (pluginIndex >= 0) {
              plugins[pluginIndex] = { ...plugins[pluginIndex], ...pluginStrippedConfig };
            }
          }
        }

        const pkgJson = getPkgJson();
        const museConfig = pkgJson.muse;
        // Handle remote plugins defined in package.json or .env
        const remotePlugins = _.clone(_.castArray(museConfig?.devConfig?.remotePlugins || []));
        if (process.env.MUSE_REMOTE_PLUGINS) {
          remotePlugins.push(
            ...process.env.MUSE_REMOTE_PLUGINS.split(';')
              .filter(Boolean)
              .map((s) => _.trim(s)),
          );
        }
        // if a plugin is defined by url like plugin-name#type:http://localhost:3030/main.js then it's loaded as a plugin
        // it could come from remotePlugins or MUSE_REMOTE_PLUGINS
        const urlPlugins = remotePlugins
          .filter(Boolean)
          .map((s) => {
            if (/:https?:/.test(s)) {
              return getPluginByUrl(s);
            } else if (s.includes(':')) {
              // it's in $path:$port format.
              // It's a folder with relative or absolute path: /Users/my/project:3030 , ../my-plugin:3031
              // Then need to get the plugin information
              const arr = s.split(':');
              const port = arr.pop();
              const folderPath = arr.join(':');
              const pkg = fs.readJsonSync(path.join(folderPath, 'package.json'));
              if (!pkg.muse) throw new Error(`It's not a Muse plugin project: ${s}`);

              return {
                name: pkg.name,
                url: `${process.env.HTTPS === 'true' ? 'https' : 'http'}://localhost:${port}/${
                  pkg.muse.type === 'boot' ? 'boot' : 'main'
                }.js`,
                type: pkg.muse.type || 'normal',
              };
            }
            // only plugin name
            return null;
          })
          .filter(Boolean);

        const localNames = [pkgJson.name];
        const localPlugins = getLocalPlugins();
        localNames.push(...localPlugins.map((p) => p.pkg.name));

        let realPluginsToLoad = [
          ...plugins.filter(
            // boot/init/lib plugins are always loaded for an app
            (p) =>
              app?.pluginConfig?.[p.name]?.core || // if configured as core plugins, always load
              p.type === 'boot' ||
              p.type === 'init' ||
              p.type === 'lib' ||
              remotePlugins.includes('*') ||
              remotePlugins.includes(p.name) ||
              localNames.includes(p.name) ||
              urlPlugins.map((up) => up.name).includes(p.name),
          ),
        ];

        const pluginByName = _.keyBy(plugins, 'name');
        localNames.forEach((name) => {
          // For a local included plugin, the bundle is from local bundle
          // Keep original plugin meta for configurations data
          if (pluginByName[name]) pluginByName[name].isLocal = true;
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
          const deployedBoot = realPluginsToLoad.find((p) => p.name === pkgJson.name);
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
          const pluginForLocal = {
            // Show plugin name in browser console
            name: 'LOCAL: ' + localNames.join(','),
            localPlugins: localNames,
            type: museConfig.type || 'normal',
            url: '/main.js',
            dev: true,
          };

          realPluginsToLoad.push(pluginForLocal);

          // If plugins are installed locally, use the local version and url
          // NOTE: Boot plugin should not depends on libs
          getMuseLibs().forEach((lib) => {
            // Exclude remote lib plugin if it's installed locally
            const localP = {
              name: lib.name,
              version: lib.version,
              isLocalLib: true,
              url: `/muse-assets/local/p/${muse.utils.getPluginId(lib.name)}/dev/main.js`,
            };
            const p = realPluginsToLoad.find((p) => p.name === lib.name);
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
        urlPlugins.forEach((up) => {
          if (pluginByName[up.name]) {
            Object.assign(pluginByName[up.name], up);
          } else plugins.push(up);
        });
      },
      processMuseGlobal: (museGlobal) => {
        museGlobal.isLocal = true;
      },
    },
  },
});

module.exports = (middlewares) => {
  // Serve local muse libs resources
  const localLibMiddlewares = getMuseLibs().map((lib) => {
    const id = muse.utils.getPluginId(lib.name);
    return {
      name: `muse-local-static-${lib.name}`,
      path: `/muse-assets/local/p/${id}`,
      middleware: express.static(path.join(lib.path, 'build')),
    };
  });

  const localPlugins = [{ path: process.cwd(), pkg: getPkgJson() }, ...getLocalPlugins()];
  const localPublicMiddlewares = localPlugins.map((item) => {
    const id = muse.utils.getPluginId(item.pkg.name);
    return {
      name: `muse-local-public-${item.pkg.name}`,
      path: `/muse-assets/local/p/${id}`,
      middleware: express.static(path.join(item.path, 'public')),
    };
  });

  try {
    // we have to ensure muse middlewares are loaded AFTER http-proxy-middleware
    let i = _.findIndex(middlewares, (m) => m.name === 'http-proxy-middleware-error-handler');
    if (i < 0) {
      // if no proxy middleware found, use first instance of webpack-dev-middleware as insertion index
      i = _.findIndex(middlewares, (m) => m.name === 'webpack-dev-middleware');
    }

    middlewares.splice(
      i + 1,
      0,
      ...localLibMiddlewares,
      ...localPublicMiddlewares,
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
