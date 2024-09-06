import debug from 'debug';
import path from 'path';
import fs from 'fs';
import * as config from '../config.js';
import { $ } from 'zx';

const log = debug('setup:clone-muse-repo');

const cloneMuseRepo = async () => {
  if (fs.existsSync(config.MUSE_REPO_LOCAL)) {
    log('muse repo already cloned');
    return;
  }
  // NOTE: always clone the whole mono repo to ensure all the packages are in sync
  log('start cloning muse repo');
  await $`git clone ${config.MUSE_REPO_REMOTE} ${config.MUSE_REPO_LOCAL}`;
  log('repo cloned');

  // Install all deps so that they can be published to the local npm registry
  log('installing deps');
  await $`cd ${path.join(config.MUSE_REPO_LOCAL, 'workspace')} && pnpm install --registry=${
    config.NPM_REGISTRY
  }`;
  log('deps installed');
};

export default cloneMuseRepo;
