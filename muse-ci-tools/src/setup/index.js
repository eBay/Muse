import debug from 'debug';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { $ } from 'zx';
import * as config from '../config.js';

// import cloneMuseRepo from './cloneMuseRepo.js';
import { startNpmRegistry, stopNpmRegistry } from './localNpmRegistry.js';
import publishPackages from './publishPackages.js';
import buildAndPublishUiPlugins from './buildAndPublishUiPlugins.js';
// import cloneMuseRepo from './cloneMuseRepo.js';

const log = debug('muse:setup');

const setup = async () => {
  log('start setup');

  // if (config.isFlagEnabled('RESET_WORKING_DIR')) {
  //   log('reset working dir');
  //   await fs.emptyDir(config.WORKING_DIR);
  // } else {
  //   log('working dir not reset');
  // }

  // if (config.isFlagEnabled('RESET_MUSE_STORAGE')) {
  //   log('reset muse storage');
  //   await fs.emptyDir(path.join(os.homedir(), 'muse-storage'));
  // } else {
  //   log('muse storage not reset');
  // }

  // For verification test, just use all public published packages to run all tests
  await startNpmRegistry();
  // await stopNpmRegistry();

  // await cloneMuseRepo();
  // return;

  if (!config.isFlagEnabled('VERIFICATION_TEST')) {
    // await cloneMuseRepo();
    await publishPackages();
    await buildAndPublishUiPlugins();
  }

  // Install Muse CLI
  log('installing muse-cli');
  await $`npm i -g @ebay/muse-cli --registry=${config.TARGET_NPM_REGISTRY}`;
  await $`muse -v`;
  log('muse-cli installed');

  log('init muse');
  await $`muse init --registry=${config.TARGET_NPM_REGISTRY}`;
  log('init muse done');

  await stopNpmRegistry();

  log('setup done');
};

export default setup;
