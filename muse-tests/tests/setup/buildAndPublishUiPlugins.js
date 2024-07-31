import { $ } from 'zx';
import path from 'path';
import fs from 'fs-extra';
import * as config from '../config.js';

const buildAndPublish = async (dir) => {
  const pkgJsonPath = path.join(dir, 'package.json');
  const pkgJson = fs.readJsonSync(pkgJsonPath);

  if (pkgJson.publishConfig.registry) {
    delete pkgJson.publishConfig.registry;
    fs.writeJsonSync(pkgJsonPath, pkgJson, { spaces: 2 });
  }
  await $`cd ${dir}`;

  //TODO: why always need cd p before all cmds?
  await $`cd ${dir} && pnpm install --registry=${config.LOCAL_NPM_REGISTRY}`;
  await $`cd ${dir} && pnpm build`;

  if (pkgJson.scripts['build:dev']) {
    await $`cd ${dir} && pnpm run build:dev`;
  }
  if (pkgJson.scripts['build:test']) {
    await $`cd ${dir} && pnpm run build:test`;
  }

  await $`cd ${dir} && pnpm publish --no-git-check --force --registry=${config.LOCAL_NPM_REGISTRY}`;

  // await $`cd ${dir}`;
  // await $`cd ${dir} && pnpm install --registry=${config.LOCAL_NPM_REGISTRY}`;
  // await $`cd ${dir} && pnpm build`;
  // await $`pnpm publish --no-git-check --force --registry=${config.LOCAL_NPM_REGISTRY}`;
};

const buildAndPublishUiPlugins = async () => {
  const folders = ['muse-boot-default', 'muse-lib-react'].map((name) =>
    path.join(config.MUSE_REPO_LOCAL, `ui-plugins/${name}`),
  );

  for (const dir of folders) {
    await buildAndPublish(dir);
  }

  const folders2 = ['muse-lib-antd', 'muse-layout-antd'].map((name) =>
    path.join(config.MUSE_REPO_LOCAL, `ui-plugins/${name}`),
  );

  for (const dir of folders2) {
    await buildAndPublish(dir);
  }
  const folders3 = ['muse-manager'].map((name) =>
    path.join(config.MUSE_REPO_LOCAL, `ui-plugins/${name}`),
  );

  for (const dir of folders3) {
    await buildAndPublish(dir);
  }
};

export default buildAndPublishUiPlugins;
