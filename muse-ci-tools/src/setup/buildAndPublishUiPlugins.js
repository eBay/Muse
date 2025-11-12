import { $ } from 'zx';
import path from 'path';
import fs from 'fs-extra';
import debug from 'debug';
import buildPlugin from '../utils/buildPlugin.js';
import npmPublish from '../utils/npmPublish.js';
import * as config from '../config.js';
import pkgExistsInRegistry from '../utils/pkgExistsInRegistry.js';

const log = debug('muse:build-ui-plugins');

// const buildAndPublish = async (dir) => {
//   const pkgJsonPath = path.join(dir, 'package.json');
//   const pkgJson = fs.readJsonSync(pkgJsonPath);

//   if (pkgJson.publishConfig.registry) {
//     delete pkgJson.publishConfig.registry;
//     fs.writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2 });
//   }
//   await $`cd ${dir}`;

//   await $`cd ${dir} && pnpm install --registry=${config.TARGET_NPM_REGISTRY}`;
//   await $`cd ${dir} && pnpm build`;

//   if (pkgJson.scripts['build:dev']) {
//     await $`cd ${dir} && pnpm run build:dev`;
//   }
//   if (pkgJson.scripts['build:test']) {
//     await $`cd ${dir} && pnpm run build:test`;
//   }

//   await $`cd ${dir} && pnpm publish --no-git-check --force --registry=${config.TARGET_NPM_REGISTRY}`;
// };

const buildAndPublishUiPlugins = async () => {
  log('build & publish ui plugins');
  // Note: the order matters here since later depends on the former
  const folders = [
    'muse-boot-default',
    'muse-lib-react',
    'muse-lib-antd',
    'muse-layout-antd',
    'muse-manager',
  ].map((name) => path.join(config.MUSE_REPO_LOCAL, `ui-plugins/${name}`));

  for (const dir of folders) {
    const pkgJsonPath = path.join(dir, 'package.json');
    const pkgJson = fs.readJsonSync(pkgJsonPath);

    log('checking if package exists in registry', pkgJson.name, pkgJson.version);
    if (await pkgExistsInRegistry(pkgJson.name, { version: pkgJson.version })) {
      log('package already exists in registry', pkgJson.name, '@', pkgJson.version);
      log('skip the build');
      continue;
    }

    await buildPlugin(dir);
    await npmPublish(dir);
  }
  log('build & publish ui plugins done');
};

export default buildAndPublishUiPlugins;
