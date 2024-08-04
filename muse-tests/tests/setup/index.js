import debug from 'debug';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import * as config from '../config.js';
import * as utils from '../utils.js';

import cloneMuseRepo from './cloneMuseRepo.js';
import startNpmRegistry from './startNpmRegistry.js';
import publishPackages from './publishPackages.js';
import buildAndPublishUiPlugins from './buildAndPublishUiPlugins.js';
const log = debug('muse:setup');

const setup = async () => {
  log('start setup');

  // Ensure .npmrc exists and set the registry to the right npm registry
  // const npmrcPath = path.join(os.homedir(), '.npmrc');
  // await fs.ensureFile(npmrcPath);
  // fs.appendFileSync(npmrcPath, `registry=${config.LOCAL_NPM_REGISTRY}\n`);

  // await fs.emptyDir(config.WORKING_DIR);
  // await cloneMuseRepo();
  await startNpmRegistry();

  await publishPackages();
  await buildAndPublishUiPlugins();

  log('setup done');

  // log('installing muse-cli');
  // await $`npm i -g @ebay/muse-cli`;
  // await $`muse -v`;
  // log('muse-cli installed');
};

export default setup;
