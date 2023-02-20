const path = require('path');
const fs = require('fs-extra');
const resolveCwd = require('resolve-cwd');
require('dotenv').config();
const museContext = require('./museContext');
const pkgJson = museContext.pkgJson;

module.exports = {
  getLocalPlugins: () => {
    const localPlugins = (process.env.MUSE_LOCAL_PLUGINS || '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);

    return localPlugins
      .map((p) => (path.isAbsolute(p) ? p : path.join(process.cwd(), p)))
      .map((p) => {
        return {
          path: p,
          pkg: require(path.join(p, 'package.json')),
        };
      });
  },

  getMuseLibs: () => {
    return Object.keys({
      ...pkgJson.dependencies,
      ...pkgJson.devDependencies,
      ...pkgJson.peerDependencies,
    }).filter((dep) => {
      try {
        const depPkgJson = require(resolveCwd(`${dep}/package.json`));
        return depPkgJson?.muse?.type === 'lib';
      } catch (error) {
        /* if we can't read the package.json (maybe due to an "exports" section that does not explicitly export ./package.json), 
           we just ignore it to avoid a monumental crash */
        console.error(
          `Error while reading ${dep}/package.json file. Either the module is not available, or the 'exports' section does not explicitly export ./package.json`,
        );
        return false;
      }
    });
  },

  assertPath: (object, p, value, notSetIfExist) => {
    const arr = p.split('.');
    while (arr.length > 1) {
      const s = arr.shift();
      if (!object[s]) object[s] = {};
      object = object[s];
    }
    if (!notSetIfExist || !object[arr[0]]) object[arr[0]] = value || {};
  },

  getPkgJson: () => {
    return fs.readJsonSync(path.join(process.cwd(), './package.json'));
  },
};
