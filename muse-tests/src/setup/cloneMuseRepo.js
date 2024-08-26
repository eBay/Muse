import debug from 'debug';
import path from 'path';
import * as config from '../config.js';
import { cd } from 'zx';

const log = debug('setup:clone-muse-repo');

const cloneMuseRepo = async () => {
  log('start cloning muse repo');
  await $`git clone ${config.MUSE_REPO_REMOTE} ${config.MUSE_REPO_LOCAL}`;
  log('repo cloned');
  log('installing deps');
  cd(path.join(config.MUSE_REPO_LOCAL, 'workspace'));
  await $`pnpm install`;
  // NOTE: other deps like ui-plugins will be installed on demand.
  log('deps installed');
};

export default cloneMuseRepo;
