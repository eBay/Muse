import fs from 'fs-extra';
import path from 'path';
import debug from 'debug';
import { $ } from 'zx';
import * as config from '../config.js';
import npmPublish from '../utils/npmPublish.js';

const log = debug('muse:setup:publish-packages');

const publishPackages = async () => {
  // if deps not installed, install them, note this only executes once
  if (!fs.existsSync(path.join(config.MUSE_REPO_LOCAL, 'workspace/node_modules'))) {
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

    // temply disable muse-runner due to node-pty installation issue
    await $`rm ${path.join(
      config.MUSE_REPO_LOCAL,
      'workspace/packages/muse-runner/package.json',
    )} `;
    // Install all deps so that they can be published to the local npm registry
    log('installing deps');
    await $`cd ${path.join(config.MUSE_REPO_LOCAL, 'workspace')} && pnpm install -f --registry=${
      config.TARGET_NPM_REGISTRY
    }`;
    log('deps installed');
  }

  log('publishing workspace packages');
  const pkgsDir = path.join(config.MUSE_REPO_LOCAL, 'workspace/packages');

  for (const dir of fs.readdirSync(pkgsDir)) {
    const fullPath = path.join(pkgsDir, dir);
    if (
      !fs.statSync(fullPath).isDirectory() ||
      !fs.existsSync(path.join(fullPath, 'package.json'))
    ) {
      continue;
    }
    await npmPublish(fullPath);
  }
  log('workspace packages published');
};

export default publishPackages;
