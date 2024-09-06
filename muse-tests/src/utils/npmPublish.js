import { $ } from 'zx';
import fs from 'fs-extra';
import path from 'path';
import * as config from '../config.js';
import debug from 'debug';
import pkgExistsInRegistry from './pkgExistsInRegistry.js';
const log = debug('muse:utils:npm-publish');
export const localPackages = {};

const publishPlugin = async (dir) => {
  log('publishing package from', dir);
  const pkgJsonPath = path.join(dir, 'package.json');
  const pkgJson = fs.readJsonSync(pkgJsonPath);

  if (await pkgExistsInRegistry(pkgJson.name)) {
    log('package already exists in registry', pkgJson.name);
    return;
  }

  if (pkgJson.publishConfig?.registry) {
    delete pkgJson.publishConfig.registry;
    fs.writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2 });
  }

  if (!config.LOCAL_NPM_REGISTRY || !config.LOCAL_NPM_REGISTRY.startsWith('http://localhost')) {
    throw new Error('LOCAL_NPM_REGISTRY is not set or not a local registry');
  }

  try {
    await $`cd ${dir} && pnpm publish --no-git-check --force --registry=${config.LOCAL_NPM_REGISTRY}`;
    log('published package', pkgJson.name, pkgJson.version);
  } catch (e) {
    log('failed to publish package', pkgJson.name, pkgJson.version, e);
  }
  localPackages[pkgJson.name] = pkgJson.version;
};

export default publishPlugin;
