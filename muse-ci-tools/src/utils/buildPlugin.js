import fs from 'fs-extra';
import path from 'path';
import { $ } from 'zx';
import _ from 'lodash';
import * as config from '../config.js';

// localPackages means the packages that are published to the local npm registry
import { localPackages } from './npmPublish.js';

/**
 * Note: to build a plugin from a UI plugin folder,
 * Need to override package versions by pnpm.overrides so that the
 * version exists in the local npm registry published by testing process
 */
const buildPlugin = async (dir) => {
  const pkgJsonPath = path.join(dir, 'package.json');
  const pkgJson = fs.readJsonSync(pkgJsonPath);

  if (config.IS_TESTING) {
    Object.entries(localPackages).forEach(([name, version]) => {
      _.set(pkgJson, `pnpm.overrides.${name}`, version);
    });
  }

  fs.writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2 });

  if (config.isFlagEnabled('RESET_PNPM_LOCK') && fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))) {
    fs.removeSync(path.join(dir, 'pnpm-lock.yaml'));
  }

  await $`cd ${dir} && pnpm install --registry=${config.TARGET_NPM_REGISTRY}`;
  await $`cd ${dir} && pnpm build`;

  if (pkgJson.scripts['build:dev']) {
    await $`cd ${dir} && pnpm run build:dev`;
  }
  if (pkgJson.scripts['build:test']) {
    await $`cd ${dir} && pnpm run build:test`;
  }
};

export default buildPlugin;
