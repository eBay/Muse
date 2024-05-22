import _ from 'lodash';
import EventEmitter from 'node:events';
import museDevUtils from '@ebay/muse-dev-utils/lib/utils.js';
import AppRunner from './AppRunner.js';
import PluginRunner from './PluginRunner.js';
import utils from './utils.js';

export default class MuseRunner extends EventEmitter {
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

  getLinkedLibs(targetPlugin, changedLibPluginRunner) {
    // Note, if no changedLibPluginRunner, means start a new plugin
    const runningLibPlugins = this.runningPlugins.filter((p) => p.pluginInfo.type === 'lib');

    const depLibs = museDevUtils.getMuseLibsByFolder(targetPlugin.dir);
    if (
      changedLibPluginRunner &&
      !depLibs.find((d) => d.name === changedLibPluginRunner.pluginInfo.name)
    ) {
      return null;
    }
    const shouldLink = depLibs.reduce((acc, lib) => {
      const found = runningLibPlugins.find((lp) => lp.pluginInfo.name === lib.name);
      if (found) {
        acc.push(found);
      }
      return acc;
    }, []);
    return shouldLink.map((d) => d.dir).join(';');
  }

  async updateMuseLinkedLibs(changedLibPluginRunner) {
    // notify running plugins to update MUSE_LINKED_LIBS if it's changed
    this.runningPlugins.forEach((rp) => {
      const linkedLibs = this.getLinkedLibs(rp, changedLibPluginRunner);
      if (linkedLibs !== null) {
        // Means the linked libs of the plugin is changed
        // Should ask the plugin dev server to restart
        // console.log('updating linked libs: ', rp.name, linkedLibs);
        // rp.cmd.ptyProcess.write(`MUSE_LINKED_LIBS=${linkedLibs}\n`);'
        this.restartPlugin({ dir: rp.dir, env: {} });
      }
    });
  }

  async startPlugin({ dir, port, env }) {
    const found = this.runningPlugins.find((r) => r.dir === dir);
    if (found) {
      return found;
    }

    const pluginRunner = new PluginRunner();
    pluginRunner.on('exit', () => {
      _.pull(this.runningPlugins, pluginRunner);
    });
    if (!env) env = {};
    const linkedLibs = this.getLinkedLibs({ dir });
    if (linkedLibs) {
      env.MUSE_LINKED_LIBS = linkedLibs;
    }
    await pluginRunner.start({ dir, port, env });
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

    if (pluginRunner.pluginInfo.type === 'lib') {
      // If a lib plugin is started or stopped,
      // need to update MUSE_LINKED_LIBS for all other running plugins
      await this.updateMuseLinkedLibs(pluginRunner);
    }
    // Emit an event to allow UI part get the change
    this.emit('start-plugin', { pluginRunner });
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
    if (pluginRunner.pluginInfo.type === 'lib') {
      // If a lib plugin is started or stopped,
      // need to update MUSE_LINKED_LIBS for all other running plugins
      await this.updateMuseLinkedLibs(pluginRunner);
    }
  }

  async restartPlugin({ dir, port, env }) {
    console.log('restart plugin: ', dir);
    await this.stopPlugin({ dir });
    await this.startPlugin({ dir, port, env });
  }
}
