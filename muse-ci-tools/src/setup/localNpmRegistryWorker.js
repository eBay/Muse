import debug from 'debug';
import { runServer } from 'verdaccio';
import { parentPort } from 'worker_threads';

import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import * as config from '../config.js';

const log = debug('muse:setup:local-npm-registry');
let serverInstance;
const startNpmRegistry = async () => {
  log('start npm registry (verdaccio)');
  // set fake token to allow annonymous npm publish to the local npm registry
  const npmrcPath = path.join(os.homedir(), '.npmrc');
  fs.ensureFileSync(npmrcPath);
  const line = `//localhost:${config.TARGET_NPM_REGISTRY_PORT}/:_authToken=fakeToken`;
  const content = await fs.readFile(npmrcPath, 'utf8');
  if (!content.includes(line)) {
    await fs.appendFile(
      npmrcPath,
      `\n//localhost:${config.TARGET_NPM_REGISTRY_PORT}/:_authToken=fakeToken\n`,
    );
  }

  if (config.isFlagEnabled('RESET_VERDACCIO_STORAGE') || !fs.existsSync(config.VERDACCIO_STORAGE)) {
    await fs.emptyDir(config.VERDACCIO_STORAGE);
  }

  const app = await runServer({
    self_path: config.WORKING_DIR,
    storage: config.VERDACCIO_STORAGE,
    max_body_size: '100mb',
    web: {
      title: 'Local NPM Registry',
    },
    uplinks: {
      npmjs: {
        url: config.UPCOMING_NPM_REGISTRY,
      },
    },
    packages: {
      '@ebay/nice-*': {
        access: '$anonymous',
        proxy: 'npmjs',
      },
      '@ebay/*': {
        access: '$anonymous',
        publish: '$anonymous',
        unpublish: '$anonymous',
      },
      '**': {
        access: '$anonymous',
        proxy: 'npmjs',
      },
    },
    server: {
      keepAliveTimeout: 60,
    },
    logs: {
      type: 'stdout',
      level: 'error',
    },
  });

  log('server started');

  await new Promise((resolve, reject) => {
    try {
      serverInstance = app.listen(config.TARGET_NPM_REGISTRY_PORT, () => {
        log('npm registry started');

        resolve();
      });
    } catch (err) {
      log(err);
      reject(err);
    }
  });
  return { app, serverInstance };
};

try {
  await startNpmRegistry();
  parentPort.postMessage('verdaccio_started');
} catch (err) {
  log(err);
  parentPort.postMessage('verdaccio_error');
}
