import debug from 'debug';
import path from 'path';
import { fileURLToPath } from 'url';
import { Worker } from 'node:worker_threads';

// Convert the module URL to a file path
const __filename = fileURLToPath(import.meta.url);

// Get the directory name of the current module
const __dirname = path.dirname(__filename);

const log = debug('muse:setup:local-npm-registry');

let worker;
const startNpmRegistry = async () => {
  log('start npm registry (verdaccio)');
  worker = new Worker(path.join(__dirname, './localNpmRegistryWorker.js'));
  log('started npm registry');

  await new Promise((resolve, reject) => {
    worker.on('message', (msg) => {
      if (msg === 'verdaccio_started') {
        resolve();
      } else if (msg === 'verdaccio_error') {
        reject(new Error('Npm registry failed to start.'));
      }
    });
  });
  // return Promise.resolve(localNpmRegistryWorker);
};

const stopNpmRegistry = async () => {
  log('stopping npm registry');
  await worker.terminate();
  log('stopped npm registry');
  return Promise.resolve();
};

export { startNpmRegistry, stopNpmRegistry };
