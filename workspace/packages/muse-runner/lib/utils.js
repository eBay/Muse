import fs from 'fs-extra';
import path from 'path';

// Detect package manager, we only support npm, yarn or pnpm.
const pkgManagers = {
  npm: 'package-lock.json',
  pnpm: 'pnpm-lock.yaml',
  yarn: 'yarn.lock',
};

const utils = {
  getPluginInfo: (dir) => {
    const pkgJson = fs.readJsonSync(path.join(dir, 'package.json'));
    return {
      name: pkgJson.name,
      pkgJson,
      type: pkgJson.muse?.type || 'normal',
      devConfig: pkgJson.muse?.devConfig,
    };
  },
  getPkgManager: (dir) => {
    const pmStatus = Object.entries(pkgManagers)
      .map(([name, lockFile]) => {
        return fs.existsSync(path.join(dir, lockFile)) ? name : null;
      })
      .filter(Boolean);

    if (pmStatus.length > 1) {
      throw new Error(
        `Multiple lock files found: ${pmStatus.join(
          ', ',
        )}. There should be one package manager for one project.`,
      );
    }

    return pmStatus[0] || 'pnpm';
  },
};

export default utils;
