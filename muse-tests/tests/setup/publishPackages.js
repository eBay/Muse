import fs from 'fs-extra';
import path from 'path';
import debug from 'debug';
import * as config from '../config.js';
import npmPublish from '../utils/npmPublish.js';

const log = debug('muse:setup:publish-packages');

const publishPackages = async () => {
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
  // Remove publishConfig.registry from all package.json files
  // so that they can be published to the local registry
  // log('removing publishConfig.registry from all package.json files');

  // fs.readdirSync(pkgsDir).forEach((pkgName) => {
  //   const pkgJsonPath = path.join(pkgsDir, pkgName, 'package.json');

  //   if (fs.existsSync(pkgJsonPath)) {
  //     log('found package', pkgJsonPath);
  //     const pkgJson = fs.readJsonSync(pkgJsonPath);
  //     if (pkgJson.publishConfig.registry) {
  //       delete pkgJson.publishConfig.registry;
  //       fs.writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2 });
  //     }
  //   }
  // });

  // await $`pwd`;
  // log('publishing packages');
  // await $`cd ${path.join(
  //   config.MUSE_REPO_LOCAL,
  //   'workspace',
  // )} && pnpm publish -r --no-git-check --force --registry=${config.LOCAL_NPM_REGISTRY}`;
  // log('packages published');
};

export default publishPackages;
