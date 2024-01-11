import _ from 'lodash';
import AppRunner from './AppRunner.js';
import PluginRunner from './PluginRunner.js';

export default class MuseRunner {
  runningApps = [];
  runningPlugins = [];
  async startApp({ id, app, env, port }) {
    const found = this.runningApps.find((r) => r.id === id);
    if (found) {
      return found;
    }

    const appRunner = new AppRunner();
    appRunner.on('exit', () => {
      _.pull(this.runningApps, appRunner);
    });

    await appRunner.start({
      id,
      app,
      env,
      port,
      runningPlugins: this.runningPlugins.map((p) => ({
        port: p.port,
        name: p.pluginInfo.name,
        type: p.pluginInfo.type,
      })),
    });
    this.runningApps.push(appRunner);
    return appRunner;
  }

  async stopApp({ id }) {
    const app = this.runningApps.find((r) => r.id === id);
    if (!app) {
      return;
      // throw new Error(`Running app not found: ${id}.`);
    }

    await app.stop();
    _.pull(this.runningApps, app);
  }
  async startPlugin({ dir, port, env, plugin }) {
    const found = this.runningPlugins.find((r) => r.dir === dir);
    if (found) {
      return found;
    }

    const pluginRunner = new PluginRunner();
    pluginRunner.on('exit', () => {
      _.pull(this.runningPlugins, pluginRunner);
    });
    await pluginRunner.start({ dir, port, env, plugin });
    this.runningPlugins.push(pluginRunner);
    this.runningApps.forEach((appRunner) => {
      appRunner.worker.postMessage({
        type: 'running-plugins',
        payload: this.runningPlugins.map((p) => ({
          port: p.port,
          name: p.pluginInfo.name,
          type: p.pluginInfo.type,
        })),
      });
    });
    return pluginRunner;
  }
  async stopPlugin({ dir }) {
    const pluginRunner = this.runningPlugins.find((r) => r.dir === dir);
    if (!pluginRunner) {
      // throw new Error(`Running plugin not found: ${dir}.`);
      return;
    }

    await pluginRunner.stop();
    _.pull(this.runningPlugins, pluginRunner);
  }
}
