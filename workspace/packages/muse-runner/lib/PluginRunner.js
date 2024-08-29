import getPort, { portNumbers } from 'get-port';
import { EventEmitter } from 'node:events';
import Command from './Command.js';
import utils from './utils.js';

/**
 * Start a Muse plugin project
 * It controls whether plusin are loaded from local bundles or deployed ones.
 */
export default class PluginRunner extends EventEmitter {
  constructor() {
    super();
  }
  async start({ dir, port, env }) {
    const realPort = port || (await getPort({ port: portNumbers(30000, 31000) }));
    const pluginInfo = utils.getPluginInfo(dir);
    pluginInfo.dir = dir;
    const devScriptName = 'start';
    const devScript = pluginInfo.pkgJson.scripts[devScriptName];
    if (!devScript) {
      throw new Error(
        `Missing "${devScriptName}" script in the package.json of the plugin: "${pluginInfo.pkgJson.name}".`,
      );
    }

    if (devScript.split(/ /).some((s) => s.startsWith('PORT='))) {
      throw new Error(
        `Should not have PORT env variable in the package script when using Muse Runner: "${devScriptName}": "${devScript}".`,
      );
    }

    const pkgManager = utils.getPkgManager(dir);

    const cmd = new Command({
      cwd: dir,
      cmd: `${pkgManager} run ${devScriptName}`,
      env: {
        PORT: realPort,
        ...env,
        // SSL_CRT_FILE: '',
        // SSL_KEY_FILE: '',
        MUSE_CONFIG_FILE: '', // The config file should be empty, so that the plugin can use the default config.
      },
    });
    cmd.start();

    this.dir = dir;
    this.port = realPort;
    this.cmd = cmd;
    this.pluginInfo = pluginInfo;
    this.name = this.pluginInfo.name;

    this.cmd.on('exit', (code) => {
      this.emit('exit', code);
    });

    return {
      port: realPort,
      cmd,
      pluginInfo,
    };
  }

  async stop() {
    this.cmd.terminate();
  }
}
