import express from 'express';
import expressWs from 'express-ws';
import _ from 'lodash';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import Conf from 'conf';
import museCore from '@ebay/muse-core';
import * as url from 'url';
import crypto from 'crypto';
import { exec } from 'node:child_process';
import fallback from 'express-history-api-fallback';
import MuseRunner from './MuseRunner.js';
import openBrowser from 'react-dev-utils/openBrowser.js';
import terminals from './apis/terminals.js';
import gitStatus from './apis/gitStatus.js';
import settings from './apis/settings.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

console.log('Starting Muse Runner...');

const config = new Conf({
  projectName: process.env.MUSE_RUNNER_CONFIG_NAME || 'muse-runner',
});
console.log('Config path: ', config.path);
const app = express();
app.use(express.json({ limit: '5MB' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
expressWs(app);

const port = parseInt(process.env.MUSE_RUNNER_PORT || '6066', 10);

const handleAsyncError = (fn) => async (req, res) => {
  try {
    return await fn(req, res);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};

function setupWebSocket(app) {
  const sockets = [];
  app.ws('/api/muse-runner-socket', (ws) => {
    ws.on('close', () => _.pull(sockets, ws));
    sockets.push(ws);
  });

  return {
    emit(msg) {
      sockets.forEach((socket) => {
        try {
          socket.send(JSON.stringify(msg));
        } catch (e) {
          // ignore socket send error
        }
      });
    },
  };
}

const io = setupWebSocket(app);

const bound = [];
const msgCache = {};
function bindOutputToSocket(id, output) {
  if (bound.includes(output)) return;
  bound.push(output);
  const arr = [];
  const flush = _.throttle(() => {
    if (!msgCache[id]) msgCache[id] = [];
    const msg = {
      type: 'output',
      data: {
        id: id || `muse-runner`,
        output: arr,
      },
    };
    msgCache[id].push(_.cloneDeep(msg));
    if (msgCache[id].length > 100) msgCache[id].shift();
    io.emit(msg);
    arr.length = 0;
  }, 100);

  const onData = (data) => {
    arr.push(data.toString().replace(/\n/g, '\n\r'));
    flush();
  };
  if (output.onData) {
    output.onData(onData);
  } else {
    output.on('data', onData);
  }
}

config.onDidAnyChange(() => {
  io.emit({
    type: 'config-data-changed',
    data: config.store,
  });
});

const getRunningData = () => {
  return {
    apps: runner.runningApps.map((r) => ({
      app: r.app,
      env: r.env,
      id: r.id,
      port: r.port,
    })),
    plugins: runner.runningPlugins.map((r) => ({
      name: r.pluginInfo.name,
      dir: r.dir,
      port: r.port,
    })),
  };
};
const handleRunningDataChange = () => {
  io.emit({
    type: 'running-data-changed',
    data: getRunningData(),
  });
};

const runner = new MuseRunner();

app.post('/api/clear-msg-cache', (req, res) => {
  const { id } = req.body;
  if (id) {
    delete msgCache[id];
  }
  res.send('ok');
});

const getAppConfig = (id) => {
  const appList = config.get('appList', []);
  const plugins = config.get('plugins', {});
  const runningPlugins = runner.runningPlugins;
  const app = _.find(appList, { id });
  app.plugins?.forEach((p) => {
    const pluginConfig = plugins[p.name] || {};
    p.dir = pluginConfig.dir;
    const found = runningPlugins.find((p2) => p2.pluginInfo.name === p.name);
    if (found) {
      p.running = true;
      p.port = found.port;
      p.type = found.pluginInfo.type;
      p.protocol = pluginConfig.protocol || (process.env.HTTPS === 'true' ? 'https' : 'http');
      p.devServer = pluginConfig.devServer;
    }

    if (pluginConfig.linkedPlugins) {
      p.linkedPlugins = pluginConfig.linkedPlugins.map((lp) => ({
        name: lp.name,
        dir: plugins[lp.name]?.dir,
      }));
    }
  });
  app.protocol = app.protocol || (process.env.HTTPS === 'true' ? 'https' : 'http');

  return app;
};
app.post(
  '/api/start-app',
  handleAsyncError(async (req, res) => {
    const { id } = req.body;
    const appList = config.get('appList', []);
    const app = appList.find((a) => a.id === id);
    if (!app) throw new Error(`App not found: ${id}`);

    const appRunner = await runner.startApp({
      id,
      app: app.app,
      env: app.env,
      port: app.port,
    });

    appRunner.on('exit', (code) => {
      handleRunningDataChange();
      io.emit({
        type: 'app-exited',
        data: {
          appId: id,
          code,
        },
      });
    });
    handleRunningDataChange();
    appRunner.worker.on('message', (msg) => {
      if (msg.type === 'call-parent-api') {
        switch (msg.payload.key) {
          case 'get-app-config':
            appRunner.worker.postMessage({
              type: 'resolve-promise',
              payload: {
                promiseId: msg.payload.promiseId,
                result: {
                  ...getAppConfig(id),
                  port: appRunner.port,
                },
              },
            });
            break;
          default:
            break;
        }
      }
    });
    bindOutputToSocket(`app:${id}`, appRunner.worker.stdout);
    msgCache[`app:${id}`] = [];
    res.setHeader('Content-Type', 'application/json');
    res.send(
      JSON.stringify({
        id,
        app: app.app,
        env: app.env,
        port: appRunner.port,
      }),
    );
  }),
);

app.post(
  '/api/new-app',
  handleAsyncError(async (req, res) => {
    const id = crypto.randomBytes(6).toString('hex');
    const appList = config.get('appList', []);
    const { app, env, ...rest } = req.body;
    appList.push({ id, app, env, ...rest });
    config.set('appList', appList);
    res.setHeader('Content-Type', 'application/json');
    res.send({ id, app, env, ...rest });
  }),
);

app.post(
  '/api/update-app',
  handleAsyncError(async (req, res) => {
    const appList = config.get('appList', []);
    const { id, app, env, ...rest } = req.body;
    const foundApp = appList.find((a) => a.id === id);
    if (!foundApp) throw new Error(`App not found: ${id}`);
    Object.assign(foundApp, { app, env, ...rest });
    config.set('appList', appList);
    res.send('ok');
  }),
);

app.post(
  '/api/remove-app',
  handleAsyncError(async (req, res) => {
    const appList = config.get('appList', []);
    const { id } = req.body;
    _.remove(appList, (a) => a.id === id);
    config.set('appList', appList);
    res.send('ok');
  }),
);

app.post(
  '/api/stop-app',
  handleAsyncError(async (req, res) => {
    const { id } = req.body;
    await runner.stopApp({ id });
    res.send('ok');
  }),
);

app.post(
  '/api/start-plugin',
  handleAsyncError(async (req, res) => {
    const { pluginName } = req.body;
    const plugins = config.get('plugins', {});
    const dir = plugins[pluginName]?.dir;
    if (!dir) throw new Error(`Plugin folder not found: ${pluginName}`);
    const MUSE_LOCAL_PLUGINS = (
      plugins[pluginName]?.linkedPlugins?.map((p) => plugins[p.name]?.dir || '') || []
    ).join(';');
    const pluginRunner = await runner.startPlugin({
      dir,
      plugin: plugins[pluginName],
      env: {
        MUSE_LOCAL_PLUGINS,
      },
    });
    pluginRunner.on('exit', (code) => {
      handleRunningDataChange();
      io.emit({
        type: 'plugin-exited',
        data: {
          pluginName: pluginRunner.pluginInfo.name,
          dir,
          code,
        },
      });
    });
    bindOutputToSocket(`plugin:${dir}`, pluginRunner.cmd.ptyProcess);
    msgCache[`plugin:${dir}}`] = [];
    handleRunningDataChange();

    res.setHeader('Content-Type', 'application/json');
    res.send(
      JSON.stringify({
        MUSE_LOCAL_PLUGINS,
        ...pluginRunner.pluginInfo,
        port: pluginRunner.port,
      }),
    );
  }),
);

app.post(
  '/api/stop-plugin',
  handleAsyncError(async (req, res) => {
    const { dir } = req.body;
    await runner.stopPlugin({ dir });
    res.send('ok');
  }),
);

app.post(
  '/api/update-plugin',
  handleAsyncError(async (req, res) => {
    const { dir, pluginName, ...rest } = req.body;
    if (dir && !fs.existsSync(dir)) throw new Error(`Folder not exist: ${dir}`);
    const plugins = config.get('plugins', {});
    if (!plugins[pluginName]) plugins[pluginName] = {};
    Object.assign(plugins[pluginName], { dir, ...rest });
    config.set('plugins', plugins);
    res.send('ok');
  }),
);

app.post(
  '/api/attach-plugin',
  handleAsyncError(async (req, res) => {
    const { appId, pluginName, mode = 'local', version, url } = req.body;
    const appList = config.get('appList', []);
    const app = appList.find((a) => a.id === appId);
    if (!app) throw new Error(`App not found: ${appId}`);
    app.plugins = app.plugins || [];

    const toSave = {
      name: pluginName,
      mode,
      version,
      url,
    };
    const foundIndex = app.plugins.findIndex((p) => p.name === pluginName);

    if (foundIndex === -1) {
      app.plugins.push(toSave);
    } else {
      app.plugins[foundIndex] = toSave;
    }

    config.set('appList', appList);
    res.send('ok');
  }),
);

app.post(
  '/api/detach-plugin',
  handleAsyncError(async (req, res) => {
    const { appId, pluginName } = req.body;
    const appList = config.get('appList', []);
    const app = appList.find((a) => a.id === appId);
    if (!app) throw new Error(`App not found: ${appId}`);
    _.remove(app.plugins, (p) => p.name === pluginName);
    config.set('appList', appList);
    res.send('ok');
  }),
);

app.post(
  '/api/link-plugin',
  handleAsyncError(async (req, res) => {
    const { mainPlugin, linkedPlugin } = req.body;
    if (mainPlugin === linkedPlugin) throw new Error('Cannot link with self');
    const plugins = config.get('plugins', {});
    if (!plugins[mainPlugin]) {
      plugins[mainPlugin] = {};
    }
    if (!plugins[mainPlugin].linkedPlugins) {
      plugins[mainPlugin].linkedPlugins = [];
    }
    if (!_.find(plugins[mainPlugin].linkedPlugins, { name: linkedPlugin })) {
      plugins[mainPlugin].linkedPlugins.push({ name: linkedPlugin });
    }
    config.set('plugins', plugins);
    res.send('ok');
  }),
);

app.post(
  '/api/unlink-plugin',
  handleAsyncError(async (req, res) => {
    const { mainPlugin, linkedPlugin } = req.body;
    const plugins = config.get('plugins', {});

    if (plugins[mainPlugin]?.linkedPlugins) {
      _.remove(plugins[mainPlugin]?.linkedPlugins, (p) => p.name === linkedPlugin);
    }
    config.set('plugins', plugins);
    res.send('ok');
  }),
);

app.get(
  '/api/muse-data',
  handleAsyncError(async (req, res) => {
    const key = req.query.key;
    const data = await museCore.data.get(key);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
  }),
);

app.get(
  '/api/init-data',
  handleAsyncError(async (req, res) => {
    const [apps, plugins] = await Promise.all([
      museCore.data.get('muse.apps'),
      museCore.data.get('muse.plugins'),
    ]);

    if (!apps || !plugins) throw new Error('Failed to get Muse apps or plugins.');

    res.setHeader('Content-Type', 'application/json');
    res.send(
      JSON.stringify({
        msgCache,
        apps,
        plugins,
        https: process.env.HTTPS === 'true',
        museLocalHost: process.env.MUSE_LOCAL_HOST_NAME || 'localhost',
      }),
    );
  }),
);

app.get(
  '/api/config-data',
  handleAsyncError(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(config.store));
  }),
);

app.get(
  '/api/running-data',
  handleAsyncError((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(getRunningData()));
  }),
);

app.post(
  '/api/clear-output',
  handleAsyncError((req, res) => {
    const { id } = req.body;
    if (id) {
      msgCache[id] = [];
    }
    res.send('ok');
  }),
);

app.post(
  '/api/open-code',
  handleAsyncError(async (req, res) => {
    const { dir } = req.body;
    if (!fs.existsSync(dir)) throw new Error(`Folder not exist: ${dir}`);
    exec(`code "${dir}"`);
    res.send('ok');
  }),
);

app.post(
  '/api/sort-apps',
  handleAsyncError(async (req, res) => {
    const { appIds } = req.body;
    const appList = config.get('appList', []);
    appList.sort((a, b) => {
      const aIndex = appIds.indexOf(a.id);
      const bIndex = appIds.indexOf(b.id);
      return aIndex - bIndex;
    });
    config.set('appList', appList);
    res.send('ok');
  }),
);

app.post(
  '/api/sort-plugins',
  handleAsyncError(async (req, res) => {
    const { pluginNames, appId } = req.body;
    const appList = config.get('appList', []);
    const app = appList.find((a) => a.id === appId);
    if (!app) throw new Error(`App not found: ${appId}`);
    app.plugins.sort((a, b) => {
      const aIndex = pluginNames.indexOf(a.name);
      const bIndex = pluginNames.indexOf(b.name);
      return aIndex - bIndex;
    });
    config.set('appList', appList);
    res.send('ok');
  }),
);

app.post('/api/open-browser', (req, res) => {
  const { url } = req.body;
  openBrowser(url);
  res.send('ok');
});

terminals({ app, io, config });
gitStatus({ app, io, config });
settings({ app, io, config });

// Serving runner Muse app
// public folder is generated by "muse export muserunner staging ./public"
app.use(express.static('./public'));
app.use(fallback('index.html', { root: path.join(__dirname, '../public') }));

app.listen(port, () => {
  console.log(`Muse Runner started at: http://localhost:${port}`);
  openBrowser(`http://localhost:${port}`);
});
