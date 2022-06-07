const path = require('path');
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
        return require(path.join(p, 'package.json'));
      });
  },

  getMuseLibs: () => {
    return Object.keys({
      ...pkgJson.dependencies,
      ...pkgJson.devDependencies,
      ...pkgJson.peerDependencies,
    }).filter((dep) => {
      const depPkgJson = require(resolveCwd(`${dep}/package.json`));
      return depPkgJson?.muse?.type === 'lib';
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
};
