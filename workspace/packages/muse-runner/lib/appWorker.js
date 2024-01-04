import { workerData, parentPort } from 'node:worker_threads';
import express from 'express';
import muse from '@ebay/muse-core';
import _ from 'lodash';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import museDevUtils from '@ebay/muse-dev-utils/lib/utils.js';
import * as url from 'url';
import museAssetsMiddleware from '@ebay/muse-express-middleware/lib/assets.js';
import museAppMiddleware from '@ebay/muse-express-middleware/lib/app.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

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
        // This is to get the vite server to transform the index.html
        // ctx.indexHtml = await theViteServer.transformIndexHtml(ctx.req.url, ctx.indexHtml);
        const appConfig = await callParentApi('get-app-config');

        const vitePorts = appConfig.plugins
          ?.filter((p) => 1 || p.devServer === 'vite')
          .map((p) => p.port)
          .filter(Boolean);
        if (!vitePorts || !vitePorts.length) return;
        const importMap = { imports: {} };
        vitePorts.forEach((vitePort) => {
          importMap.imports[`http://localhost:${vitePort}/@react-refresh`] = `/@react-refresh`;
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
        const appConfig = await callParentApi('get-app-config');
        return { appName: appConfig.app, envName: appConfig.env };
      },

      // TODO: the logic here seems to be too complicated, need more detailed comments
      processAppInfo: async ({ app, env }) => {
        // All deployed plugins on the app
        const deployedPluginByName = _.keyBy(env.plugins, 'name');

        // Get the app config in muse runner from parent process
        const appConfig = await callParentApi('get-app-config');

        if (!env.variables) env.variables = {};
        if (!env.pluginVariables) env.pluginVariables = {};

        Object.assign(env.variables, appConfig.variables || {});
        Object.entries(appConfig.pluginVariables || {}).forEach(([pluginName, variables]) => {
          if (!env.pluginVariables[pluginName]) env.pluginVariables[pluginName] = {};
          Object.assign(env.pluginVariables[pluginName], variables);
        });

        const linkedPlugins = [];

        // For local installed lib plugins, need to load them
        // from local dev server of the parent plugin
        // Here use localLibs to store the local lib plugins' urls
        const localLibPluings = {};

        appConfig?.plugins?.forEach((p) => {
          // NOTE: if a plugin specified deployed mode but not found, just return
          if (p.mode === 'deployed') return;
          let deployedPlugin = deployedPluginByName[p.name];

          // If the configured plugin is not deployed, then add it
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
              break;
            case 'local': {
              if (p.running) {
                if (1 || p.devServer === 'vite') {
                  deployedPlugin.url = `http://localhost:${p.port}/src/index.js`;
                  deployedPlugin.esModule = true;
                } else {
                  deployedPlugin.url = `http://localhost:${p.port}/${
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
        });
      },
    },
  },
});

const app = express();
app.use(cors());

// Proxy /@react-refresh and /@vite/client to the vite dev server
// TODO: vite/client seems useless but just for no error
app.use('/@react-refresh', express.static(path.join(__dirname, 'reactFastRefresh.js')));
// app.get('/@react-refresh', async (req, res) => {
//   const appConfig = await callParentApi('get-app-config');

//   // Find the first vite dev server, use it to serve `/@react-refresh`
//   const vitePort = appConfig?.plugins?.find(
//     (p) => 1 || (p.mode === 'local' && p.running && p.devServer === 'vite'),
//   )?.port;

//   if (!vitePort) {
//     res.status(404).send('Not found');
//   }
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   const targetUrl = `http://localhost:${vitePort}${req.originalUrl}`;

//   http
//     .get(targetUrl, function(resApi) {
//       res.writeHead(resApi.statusCode);
//       resApi.pipe(res);
//     })
//     .end();
// });

app.use(museAssetsMiddleware({}));

app.use(
  museAppMiddleware({
    isDev: true,
    isLocal: true,
    cdn: '/muse-assets',
  }),
);

app.listen(port, () => {
  const host = process.env.MUSE_LOCAL_HOST_NAME || 'localhost';
  console.log(`Muse app started: http://${host}:${port}`);
});
