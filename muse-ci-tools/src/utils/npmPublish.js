import { $ } from 'zx';
import fs from 'fs-extra';
import path from 'path';
import * as config from '../config.js';
import debug from 'debug';
import pkgExistsInRegistry from './pkgExistsInRegistry.js';
const log = debug('muse:utils:npm-publish');
export const localPackages = {};

/**
 * Publish a npm package, if it exists, unpublish it first then publish it
 * @param {*} dir the directory of the package
 */
const publishPlugin = async (dir) => {
  log('publishing package from', dir);
  const pkgJsonPath = path.join(dir, 'package.json');
  const pkgJson = fs.readJsonSync(pkgJsonPath);

  if ((await pkgExistsInRegistry(pkgJson.name)) && config.IS_TESTING) {
    log('package already exists in registry, republish it...', pkgJson.name);
    await $`pnpm unpublish --force ${pkgJson.name}@${pkgJson.version} --registry=${config.TARGET_NPM_REGISTRY}`;
    log('package unpublished', pkgJson.name, pkgJson.version);
  }

  if (config.IS_TESTING && pkgJson.publishConfig?.registry) {
    delete pkgJson.publishConfig.registry;
    fs.writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2 });
  }

  if (!config.TARGET_NPM_REGISTRY) {
    throw new Error('TARGET_NPM_REGISTRY is not set.');
  }

  try {
    await $`cd ${dir} && pnpm publish ${
      config.IS_TESTING ? '--no-git-check --force' : '--no-git-check'
    } --registry=${config.TARGET_NPM_REGISTRY} --access public`;
    log('published package', pkgJson.name, pkgJson.version, config.TARGET_NPM_REGISTRY);
  } catch (e) {
    log('failed to publish package', pkgJson.name, pkgJson.version, e);
  }
  localPackages[pkgJson.name] = pkgJson.version;
};

export default publishPlugin;
