import debug from 'debug';
import path from 'path';
import * as config from '../config.js';
import * as utils from '../utils.js';
import { cd } from 'zx';

const log = debug('setup-env');

const cloneMuseRepo = async () => {
  log('start cloning muse repo');
  await $`git clone ${config.MUSE_REPO} ${config.TEMP_MUSE_REPO}`;
  log('repo cloned');
};

const packPackage = async (folderName, pkgPath) => {
  log(`packing package ${folderName}`);
  cd(pkgPath || path.join(config.TEMP_MUSE_REPO, 'workspace/packages', folderName));
  await $`pnpm pack ${folderName} --pack-destination ${config.PACKED_PACKAGES_FOLDER}`;
  log(`package ${folderName} packed`);
};

const setupEnv = async () => {
  log('setup env');
  await cloneMuseRepo();
  await packPackage('muse-core');
  await packPackage('muse-client');
  cd(path.join(config.TEMP_FOLDER, 'muse-repo'));
  utils.getLocalPackages();
};

export default setupEnv;
