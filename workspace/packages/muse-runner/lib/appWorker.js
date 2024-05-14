import { workerData, parentPort } from 'node:worker_threads';
import fs from 'node:fs';
import express from 'express';
import muse from '@ebay/muse-core';
import _ from 'lodash';
import cors from 'cors';
import https from 'node:https';
import path from 'path';
import crypto from 'crypto';
import museDevUtils from '@ebay/muse-dev-utils/lib/utils.js';
import * as url from 'url';
import museAssetsMiddleware from '@ebay/muse-express-middleware/lib/assets.js';
import museAppMiddleware from '@ebay/muse-express-middleware/lib/app.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const host = process.env.MUSE_LOCAL_HOST_NAME || 'localhost';

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
      processIndexHtml: async (ctx) => {
        // This is to support vite-react
        // This may need to be implemented as a plugin
        const appConfig = await callParentApi('get-app-config');
        const viteProtocolAndPorts = appConfig.plugins
          ?.filter((p) => p.esModule && p.running)
          .map((p) => [p.port, p.protocol])
          .filter(Boolean);
        if (!viteProtocolAndPorts || !viteProtocolAndPorts.length) return;
        const importMap = { imports: {} };
        viteProtocolAndPorts.forEach(([vitePort, protocol]) => {
          importMap.imports[`${protocol}://${host}:${vitePort}/@react-refresh`] = `/@react-refresh`;
        });
        ctx.indexHtml = ctx.indexHtml.replace(
          '<head>',
          `<head>

  <script type="importmap">
${JSON.stringify(importMap, null, 2)}
  </script>
  <script type="module">
    import RefreshRuntime from "/@react-refresh"
    RefreshRuntime.injectIntoGlobalHook(window)
    window.$RefreshReg$ = () => {}
    window.$RefreshSig$ = () => (type) => type
    window.__vite_plugin_react_preamble_installed__ = true
  </script>`,
        );
      },
      getAppInfo: async () => {
        // NOTE: appConfig always changes, so need to get it every time
        const appConfig = await callParentApi('get-app-config');
        return { appName: appConfig.app, envName: appConfig.env };
      },

      // Use this ext point to process the app info, and set the env variables
      processAppInfo: async ({ app, env }) => {
        // Get the app config in muse runner from parent process
        // NOTE: appConfig always changes, so need to get it every time
        // This gets all data about the app, including the plugins, variables, envs, etc.
        const appConfig = await callParentApi('get-app-config');

        // All deployed plugins on the app
        const deployedPluginByName = _.keyBy(env.plugins, 'name');

        if (!env.variables) env.variables = {};
        if (!env.pluginVariables) env.pluginVariables = {};

        // Override dev time app variables
        Object.assign(env.variables, appConfig.variables || {});

        // Override dev time plugin variables
        Object.entries(appConfig.pluginVariables || {}).forEach(([pluginName, variables]) => {
          if (!env.pluginVariables[pluginName]) env.pluginVariables[pluginName] = {};
          Object.assign(env.pluginVariables[pluginName], variables);
        });

        const linkedPlugins = [];

        // For local installed lib plugins, need to load them
        // from local dev server of the parent plugin
        // Here use localLibs to store the local lib plugins' urls
        const localLibPluings = {};

        // Determine how to load the plugins
        appConfig?.plugins?.forEach((p) => {
          // NOTE: if a plugin specified deployed mode but not found, just return
          if (p.mode === 'deployed') return;
          let deployedPlugin = deployedPluginByName[p.name];

          // If the configured plugin is not deployed, then add it
          // If a plugin is local but not deployed and not running, it's not added
          // The url will be set later
          if (!deployedPlugin && (p.mode !== 'local' || p.running)) {
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
              deployedPlugin.esModule = !!p.urlEsModule;
              break;
            case 'local': {
              if (p.running) {
                const pluginProtocol = p.protocol || 'https';
                if (p.esModule) {
                  const entryFile = museDevUtils.getEntryFile(p.dir);
                  deployedPlugin.url = `${pluginProtocol}://${host}:${p.port}/${entryFile}`;
                  deployedPlugin.esModule = true;
                } else {
                  deployedPlugin.url = `${pluginProtocol}://${host}:${p.port}/${
                    p.type === 'boot' ? 'boot' : 'main'
                  }.js`;
                }
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

                // Serve lib plugins from the first running plugin
                // We don't handle lib plugin version conflicts here because
                // all local running plugins on the app should have the same version of a lib plugin
                // There should be auto update logic to ensure all plugins have the same version of a lib plugin
                // We don't serve lib plugins from remote because maybe a lib plugin has not been deployed yet.
                _.uniqBy(museLibs, 'name').forEach((lib) => {
                  if (localLibPluings[lib.name]) return;
                  const pid = muse.utils.getPluginId(lib.name);
                  localLibPluings[lib.name] = {
                    url: `${pluginProtocol}://${host}:${p.port}/muse-assets/local/p/${pid}/dev/main.js`,
                    version: lib.version,
                  };
                });
              }
              break;
            }
            case 'deployed':
              // already return
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
          // TODO: may not need this logic since link mechanism will be changed
        });
      },
    },
  },
});

const app = express();
app.use(cors());

// TODO: vite/client seems useless but just for no error
app.use('/@react-refresh', express.static(path.join(__dirname, 'reactFastRefresh.js')));

app.use(museAssetsMiddleware({}));

app.use(
  museAppMiddleware({
    isDev: true,
    isLocal: true,
    cdn: '/muse-assets',
  }),
);

const appConfig = await callParentApi('get-app-config');
const isHttps = appConfig.protocol !== 'http';

if (
  isHttps &&
  (!process.env.SSL_CRT_FILE ||
    !process.env.SSL_KEY_FILE ||
    !fs.existsSync(process.env.SSL_KEY_FILE) ||
    !fs.existsSync(process.env.SSL_CRT_FILE))
) {
  console.log('Failed to start app: SSL_KEY_FILE and SSL_CRT_FILE are required for https');
  process.exit(1);
} else if (isHttps) {
  https
    .createServer(
      {
        key: fs.readFileSync(process.env.SSL_KEY_FILE),
        cert: fs.readFileSync(process.env.SSL_CRT_FILE),
      },
      app,
    )
    .listen(port);

  console.log(`Muse app started: https://${host}:${port}`);
} else {
  app.listen(port, () => {
    const host = process.env.MUSE_LOCAL_HOST_NAME || 'localhost';
    console.log(`Muse app started: http://${host}:${port}`);
  });
}
