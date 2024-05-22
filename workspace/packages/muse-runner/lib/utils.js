import fs from 'fs-extra';
import path from 'path';
import _ from 'lodash';

// Detect package manager, we only support npm, yarn or pnpm.
const pkgManagers = {
  npm: 'package-lock.json',
  pnpm: 'pnpm-lock.yaml',
  yarn: 'yarn.lock',
};

const utils = {
  getPluginInfo: (dir) => {
    const pkgJson = fs.readJsonSync(path.join(dir, 'package.json'));
    return {
      name: pkgJson.name,
      pkgJson,
      type: pkgJson.muse?.type || 'normal',
      esModule: pkgJson.type === 'module',
      devConfig: pkgJson.muse?.devConfig,
    };
  },
  getPkgManager: (dir) => {
    const pmStatus = Object.entries(pkgManagers)
      .map(([name, lockFile]) => {
        return fs.existsSync(path.join(dir, lockFile)) ? name : null;
      })
      .filter(Boolean);

    if (pmStatus.length > 1) {
      throw new Error(
        `Multiple lock files found: ${pmStatus.join(
          ', ',
        )}. There should be one package manager for one project.`,
      );
    }

    return pmStatus[0] || 'pnpm';
  },
  getAppConfig: ({ config, runner, id }) => {
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
        p.esModule = found.pluginInfo.esModule;
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
  },
};

export const handleAsyncError = (fn) => async (req, res) => {
  try {
    return await fn(req, res);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};

export default utils;
