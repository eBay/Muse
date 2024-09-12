import debug from 'debug';
import path from 'path';
import fs from 'fs';
import * as config from '../config.js';
import { $ } from 'zx';

const log = debug('setup:clone-muse-repo');

const cloneMuseRepo = async () => {
  // if (!fs.existsSync(config.MUSE_REPO_LOCAL)) {
  // NOTE: always clone the whole mono repo to ensure all the packages are in sync
  // log('start cloning muse repo');
  // await $`git clone ${config.MUSE_REPO_REMOTE} ${config.MUSE_REPO_LOCAL}`;
  // log('repo cloned');

  if (config.isFlagEnabled('RESET_PNPM_LOCK')) {
    log('removing package-lock.yaml files');

    const checkPaths = [path.join(config.MUSE_REPO_LOCAL, 'workspace')];
    const pkgsDir = path.join(config.MUSE_REPO_LOCAL, 'workspace/packages');
    for (const dir of fs.readdirSync(pkgsDir)) {
      checkPaths.push(path.join(pkgsDir, dir));
    }
    checkPaths.forEach((p) => {
      if (fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'pnpm-lock.yaml'))) {
        fs.rmSync(path.join(p, 'pnpm-lock.yaml'));
      }
    });
  }

  // Install all deps so that they can be published to the local npm registry
  log('installing deps');
  await $`cd ${path.join(config.MUSE_REPO_LOCAL, 'workspace')} && pnpm install -f --registry=${
    config.LOCAL_NPM_REGISTRY
  }`;
  log('deps installed');
  // return;
  // } else {
  //   log('muse repo already cloned');
  // }
};

export default cloneMuseRepo;
