import debug from 'debug';
import { runServer } from 'verdaccio';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import * as config from '../config.js';

const log = debug('muse:setup:start-npm-registry');

const startNpmRegistry = async () => {
  log('start npm registry (verdaccio)');

  // set fake token to allow annonymous npm publish to the local npm registry
  const npmrcPath = path.join(os.homedir(), '.npmrc');
  const line = `//localhost:${config.LOCAL_NPM_REGISTRY_PORT}/:_authToken=fakeToken`;
  const content = await fs.readFile(npmrcPath, 'utf8');
  if (!content.includes(line)) {
    await fs.appendFile(
      npmrcPath,
      `\n//localhost:${config.LOCAL_NPM_REGISTRY_PORT}/:_authToken=fakeToken\n`,
    );
    return;
  }

  // fs.emptyDir(config.VERDACCIO_STORAGE);
  const app = await runServer({
    self_path: config.WORKING_DIR,
    storage: config.VERDACCIO_STORAGE,
    max_body_size: '100mb',
    web: {
      title: 'Verdaccio',
    },
    uplinks: {
      npmjs: {
        url: config.get('UPCOMING_NPM_REGISTRY'),
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
      },
      '**': {
        access: '$anonymous',
        proxy: 'npmjs',
      },
    },
    server: {
      keepAliveTimeout: 60,
    },
    log: {
      level: 'info',
    },
  });

  await new Promise((resolve) =>
    app.listen(config.LOCAL_NPM_REGISTRY_PORT, () => {
      // do something
      log('npm registry started');
      resolve();
    }),
  );

  return app;
};
export default startNpmRegistry;
