import fs from 'fs-extra';
import path from 'path';

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
};

export default utils;
