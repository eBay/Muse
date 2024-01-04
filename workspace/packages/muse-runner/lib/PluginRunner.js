import getPort, { portNumbers } from 'get-port';
import { EventEmitter } from 'node:events';
import Command from './Command.js';
import logger from '@ebay/muse-core/lib/logger.js';
import utils from './utils.js';

const log = logger.createLogger('muse-runner.plugin-runner');

/**
 * Start a Muse plugin project
 * It controls whether plusin are loaded from local bundles or deployed ones.
 */
export default class PluginRunner extends EventEmitter {
  constructor() {
    super();
  }
  async start({ dir, port, env, startScriptName }) {
    const realPort = port || (await getPort({ port: portNumbers(30000, 31000) }));
    const pluginInfo = utils.getPluginInfo(dir);
    pluginInfo.dir = dir;
    startScriptName = startScriptName || 'start';
    const startScript = pluginInfo.pkgJson.scripts[startScriptName].replace(
      /PORT=\d+/,
      `PORT=${realPort}`,
    );
    log.info('startScript', startScript);
    const cmd = new Command({
      cwd: dir,
      cmd: 'pnpm start',
      // cmd: `${
      //   pluginInfo.pkgJson.scripts.prestart ? 'npm run prestart && ' : ''
      // }npm exec -c "${startScript}"`,
      env: {
        PORT: realPort,
        REACT_REFRESH_ENDPOINT: `http://localhost:${50000}/@react-refresh`,
        ...env,
      },
    });
    cmd.start();

    this.dir = dir;
    this.port = realPort;
    this.cmd = cmd;
    this.pluginInfo = pluginInfo;

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
