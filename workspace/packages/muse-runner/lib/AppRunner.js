import { Worker } from 'node:worker_threads';
import path from 'path';
import * as url from 'url';
import getPort, { portNumbers } from 'get-port';
import { EventEmitter } from 'node:events';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Start a Muse app at dev mode.
 * It controls whether plusin are loaded from local bundles or deployed ones.
 * It also allows to change app/env
 */
export default class AppRunner extends EventEmitter {
  async start({ id, port, app, env = 'staging' }) {
    this.id = id;
    if (this.worker) {
      throw new Error(`App already started.`);
    }
    const realPort = port || (await getPort({ port: portNumbers(50000, 50500) }));

    // Use a worker, so that we can get seperate stdout of the current server.
    const worker = new Worker(path.join(__dirname, './appWorker.js'), {
      env: process.env,
      workerData: {
        id,
        port: realPort,
      },
    });
    this.app = app;
    this.env = env;
    this.port = realPort;

    worker.on('error', (err) => {
      // TODO: handle error
      console.log('[worker error]', err);
      // this.emit('error', err);
    });
    worker.on('exit', (code) => {
      this.emit('exit', code);
    });

    this.worker = worker;

    return {
      port: realPort,
      worker,
    };
  }

  async stop() {
    await this.worker.terminate();
  }
}
