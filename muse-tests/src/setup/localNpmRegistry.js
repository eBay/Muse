import debug from 'debug';
// import { runServer } from 'verdaccio';
// import fs from 'fs-extra';
// import os from 'os';
// import path from 'path';
// import * as config from '../config.js';

// const log = debug('muse:setup:local-npm-registry');
// let serverInstance;
// const startNpmRegistry = async () => {
//   log('start npm registry (verdaccio)');
//   // set fake token to allow annonymous npm publish to the local npm registry
//   const npmrcPath = path.join(os.homedir(), '.npmrc');
//   fs.ensureFileSync(npmrcPath);
//   const line = `//localhost:${config.LOCAL_NPM_REGISTRY_PORT}/:_authToken=fakeToken`;
//   const content = await fs.readFile(npmrcPath, 'utf8');
//   if (!content.includes(line)) {
//     await fs.appendFile(
//       npmrcPath,
//       `\n//localhost:${config.LOCAL_NPM_REGISTRY_PORT}/:_authToken=fakeToken\n`,
//     );
//   }

//   if (config.isFlagEnabled('RESET_VERDACCIO_STORAGE') || !fs.existsSync(config.VERDACCIO_STORAGE)) {
//     await fs.emptyDir(config.VERDACCIO_STORAGE);
//   }

//   const app = await runServer({
//     self_path: config.WORKING_DIR,
//     storage: config.VERDACCIO_STORAGE,
//     max_body_size: '100mb',
//     web: {
//       title: 'Verdaccio',
//     },
//     uplinks: {
//       npmjs: {
//         url: config.UPCOMING_NPM_REGISTRY,
//       },
//     },
//     packages: {
//       '@ebay/nice-*': {
//         access: '$anonymous',
//         proxy: 'npmjs',
//       },
//       '@ebay/*': {
//         access: '$anonymous',
//         publish: '$anonymous',
//         unpublish: '$anonymous',
//       },
//       '**': {
//         access: '$anonymous',
//         proxy: 'npmjs',
//       },
//     },
//     server: {
//       keepAliveTimeout: 60,
//     },
//     logs: {
//       type: 'stdout',
//       level: 'error',
//     },
//   });

//   log('server started');

//   await new Promise((resolve, reject) => {
//     try {
//       serverInstance = app.listen(config.LOCAL_NPM_REGISTRY_PORT, () => {
//         log('npm registry started');
//         resolve();
//       });
//     } catch (err) {
//       log(err);
//       reject(err);
//     }
//   });
//   return { app, serverInstance };
// };

// const stopNpmRegistry = () => {
//   return new Promise((resolve, reject) => {
//     if (serverInstance) {
//       serverInstance.close((err) => {
//         if (err) {
//           log(err);
//           reject(err);
//         } else {
//           log('npm registry stopped');
//           resolve();
//         }
//       });
//     } else {
//       resolve();
//     }
//   });
// };
// export { startNpmRegistry, stopNpmRegistry };

import path from 'path';
import { fileURLToPath } from 'url';
import { Worker } from 'node:worker_threads';

// Convert the module URL to a file path
const __filename = fileURLToPath(import.meta.url);

// Get the directory name of the current module
const __dirname = path.dirname(__filename);

const log = debug('muse:setup:local-npm-registry');

let localNpmRegistryWorker;
const startNpmRegistry = async () => {
  log('start npm registry (verdaccio)');
  localNpmRegistryWorker = new Worker(path.join(__dirname, './localNpmRegistryWorker.js'));
  log('started npm registry');

  // localNpmRegistryWorker.stdout.pipe(process.stdout);
  // localNpmRegistryWorker.stderr.pipe(process.stderr);

  // worker.on('message', console.log);
  // localNpmRegistryWorker.on('error', () => {
  // throw new Error('Npm registry worker error');
  // });

  // localNpmRegistryWorker.on('message', (msg) => {
  //   console.log(msg);
  // });
  // worker.on('exit', (code) => {
  //   logger.info(`Worker exited with code ${code}.`);
  //   resolve(code);
  // });
  return Promise.resolve(localNpmRegistryWorker);
};

const stopNpmRegistry = async () => {
  log('stopping npm registry');
  await localNpmRegistryWorker.terminate();
  log('stopped npm registry');
  return Promise.resolve();
};

export { startNpmRegistry, stopNpmRegistry };
