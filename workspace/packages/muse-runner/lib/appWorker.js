import { workerData, parentPort } from 'node:worker_threads';
import express from 'express';
import muse from '@ebay/muse-core';
import _ from 'lodash';
import crypto from 'crypto';
import museDevUtils from '@ebay/muse-dev-utils/lib/utils.js';

import museAssetsMiddleware from '@ebay/muse-express-middleware/lib/assets.js';
import museAppMiddleware from '@ebay/muse-express-middleware/lib/app.js';

const { port } = workerData;
const promiseResolvers = {};
parentPort.on('message', (msg) => {
  if (msg.type === 'resolve-promise') {
    const resolve = promiseResolvers[msg.payload.promiseId];
    if (resolve) {
      resolve(msg.payload.result);
      delete promiseResolvers[msg.payload.promiseId];
    }
  }
});

const callParentApi = (key) => {
  const promiseId = crypto.randomBytes(12).toString('hex');
  const promise = new Promise((resolve) => {
    promiseResolvers[promiseId] = resolve;
    parentPort.postMessage({
      type: 'call-parent-api',
      payload: {
        promiseId,
        key,
      },
    });
  });

  return promise;
};
muse.plugin.register({
  name: 'muse-runner',
  museMiddleware: {
    app: {
      getAppInfo: async () => {
        const appConfig = await callParentApi('get-app-config');
        return { appName: appConfig.app, envName: appConfig.env };
      },

      // TODO: the logic here seems to be too complicated, need more detailed comments
      processAppInfo: async ({ app, env }) => {
        const deployedPluginByName = _.keyBy(env.plugins, 'name');
        const appConfig = await callParentApi('get-app-config');

        const linkedPlugins = [];

        // For local installed lib plugins, need to load them
        // from local dev server of the parent plugin
        // Here use localLibs to store the local lib plugins' urls
        const localLibPluings = {};

        appConfig?.plugins?.forEach((p) => {
          if (p.mode === 'deployed') return;
          let deployedPlugin = deployedPluginByName[p.name];

          if (!deployedPlugin) {
            // If a plugin specified deployed mode but not found, just return
            deployedPlugin = {
              name: p.name,
              type: p.type,
            };
            deployedPluginByName[p.name] = deployedPlugin;
            env.plugins.push(deployedPlugin);
          }
          // set a flag to avoid being removed

          switch (p.mode) {
            case 'excluded':
              _.remove(env.plugins, (p2) => p2.name === p.name);
              break;
            case 'version':
              deployedPlugin.version = p.version;
              break;
            case 'url':
              deployedPlugin.url = p.url;
              break;
            case 'local': {
              if (p.running) {
                deployedPlugin.url = `http://localhost:${p.port}/${
                  p.type === 'boot' ? 'boot' : 'main'
                }.js`;
                deployedPlugin.isLocal = true;
                linkedPlugins.push(
                  ...(p.linkedPlugins || []).map((lp) => ({
                    name: lp.name,
                    parent: p.name,
                  })),
                );

                // Get all installed libs, and add them to localLibPluings
                const museLibs = museDevUtils.getMuseLibsByFolder(p.dir);
                p.linkedPlugins?.forEach((lp) => {
                  museDevUtils.getMuseLibsByFolder(lp.dir).forEach((lib) => {
                    museLibs.push(lib);
                  });
                });

                _.uniqBy(museLibs, 'name').forEach((lib) => {
                  if (localLibPluings[lib.name]) return;
                  const pid = muse.utils.getPluginId(lib.name);
                  localLibPluings[lib.name] = {
                    url: `http://localhost:${p.port}/muse-assets/local/p/${pid}/dev/main.js`,
                    version: lib.version,
                  };
                });
              }
              break;
            }
            case 'deployed':
              // do nothing, just use the deployed version
              break;
            default:
              // some error happened?
              break;
          }
        });

        linkedPlugins.forEach((lp) => {
          const name = `${lp.name} (linked to ${lp.parent})})`;
          if (deployedPluginByName[lp.name]) {
            deployedPluginByName[lp.name].linkedTo = lp.parent;
          } else {
            env.plugins.push({
              name: name,
              linkedTo: lp.parent,
              type: lp.type,
            });
          }
        });

        const configPluginByName = _.keyBy(appConfig.plugins, 'name');
        if (!appConfig.loadAllPlugins) {
          // NOTE: exluded plugins already removed
          env.plugins = env.plugins.filter(
            // boot/init/lib plugins are always loaded for an app
            (p) =>
              app?.pluginConfig?.[p.name]?.core || // if configured as core plugins, always load
              p.type === 'boot' ||
              p.type === 'init' ||
              p.type === 'lib' ||
              configPluginByName[p.name] || // NOTE: excluded plugins already removed
              p.linkedTo, // if a plugin is linked, need to get config, so we need to load it
          );
        }

        // For local installed lib plugins, need to serve them from local dev server if the mode is local or undefined
        const pluginMode = _.mapValues(configPluginByName, 'mode');
        env.plugins.forEach((p) => {
          // For a lib plugin, if installed locally, then serve it from local
          // dev server unless the mode is 'version' or 'deployed' or 'url'

          // If it's local and running, the url is already set
          if (p.url || p.type !== 'lib' || !localLibPluings[p.name]) {
            return;
          }

          const mode = pluginMode[p.name];
          if (!mode || mode === 'local') {
            p.url = localLibPluings[p.name].url;
            p.deployedVersion = p.version;
            p.version = localLibPluings[p.name].version;
            p.isLocalLib = true;
          }
        });

        // For new local installed lib plugins
        _.keys(localLibPluings).forEach((name) => {
          // If lib plugin not deployed and not excluded, add it
          if (_.find(env.plugins, { name }) || pluginMode[name] === 'excluded') return;
          env.plugins.push({
            name: name,
            type: 'lib',
            url: localLibPluings[name].url,
            version: localLibPluings[name].version,
            isLocalLib: true,
            notDeployed: true,
          });
        });

        // If a lib plugin is linked to some other running (local mode) plugin,
        // Then don't load it from anywhere else
        env.plugins.forEach((p) => {
          // if (p.linkedTo && !p.running) delete p.url;
        });
      },
    },
  },
});

const app = express();

app.use(museAssetsMiddleware({}));

app.use(
  museAppMiddleware({
    isDev: true,
    isLocal: true,
    cdn: '/muse-assets',
  }),
);

app.listen(port, () => {
  console.log(`Muse app started: http://local.cloud.ebay.com:${port}`);
});
