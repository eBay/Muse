import debug from 'debug';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { $ } from 'zx';
import * as config from '../config.js';

import cloneMuseRepo from './cloneMuseRepo.js';
import startNpmRegistry from './startNpmRegistry.js';
import publishPackages from './publishPackages.js';
import buildAndPublishUiPlugins from './buildAndPublishUiPlugins.js';
const log = debug('muse:setup');

const setup = async () => {
  log('start setup');

  const npmrcPath = path.join(os.homedir(), '.npmrc');
  await fs.ensureFile(npmrcPath);
  // fs.appendFileSync(npmrcPath, `registry=${config.LOCAL_NPM_REGISTRY}\n`);

  if (config.isFlagEnabled('RESET_WORKING_DIR')) {
    await fs.emptyDir(config.WORKING_DIR);
  }

  if (config.isFlagEnabled('RESET_MUSE_STORAGE')) {
    await fs.emptyDir(path.join(os.homedir(), 'muse-storage'));
  }

  // For verification test, just use all public published packages to run all tests
  if (!config.isFlagEnabled('VERIFICATION_TEST')) {
    await cloneMuseRepo();
    await startNpmRegistry();
    await publishPackages();
    await buildAndPublishUiPlugins();
  }

  // Install Muse CLI
  log('installing muse-cli');
  await $`npm i -g @ebay/muse-cli`;
  await $`muse -v`;
  log('muse-cli installed');

  log('setup done');
};

export default setup;
