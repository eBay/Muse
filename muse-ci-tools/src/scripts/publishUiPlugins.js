/**
 * This script is used to publish ui-plugins to the npm registry.
 * It checks if the package already exists in the registry before publishing.
 * This script is used for automated publishing of ui-plugins to the npm registry.
 * It is used in the CI/CD pipeline and public github actions.
 */
import { $ } from 'zx';
import path from 'path';
import debug from 'debug';

import fs from 'fs-extra';
import config from '../config.js';
import pkgExistsInRegistry from '../utils/pkgExistsInRegistry.js';

if (!process.env.DEBUG) {
  // we use debug as logger
  debug.enable('muse:*');
}

$.verbose = true;

const log = debug('muse:scripts:publish-ui-plugins');

const uiPlugins = ['muse-boot-default', 'muse-lib-react', 'muse-lib-antd', 'muse-layout-antd'];
const registryUrl = process.env.NPM_REGISTRY_TO_PUBLISH || 'http://localhost:5873/';

const tmpRepoDir = path.join(process.cwd(), '../');

for (const folderName of uiPlugins) {
  const pkgJson = fs.readJsonSync(path.join(tmpRepoDir, 'ui-plugins', folderName, 'package.json'));
  const { name, version } = pkgJson;
  if (
    !(await pkgExistsInRegistry(name, {
      version,
      registryUrl,
    }))
  ) {
    log(`pkg does not exist: ${name}@${version}, publishing...`);
    await $`npm publish ${path.join(
      tmpRepoDir,
      'ui-plugins',
      folderName,
    )} --access public --registry=${registryUrl}`;
  } else {
    log(`pkg already exists: ${name}@${version}`);
  }
}

log('Done.');
