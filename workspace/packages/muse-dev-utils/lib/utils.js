const path = require('path');
const fs = require('fs-extra');
const resolveCwd = require('resolve-cwd');
const resolveFrom = require('resolve-from');
const _ = require('lodash');
require('dotenv').config();
const museContext = require('./museContext');
const pkgJson = museContext.pkgJson;
const { isDev } = museContext;

const getLocalPlugins = () => {
  const localPlugins = (process.env.MUSE_LOCAL_PLUGINS || '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  return localPlugins
    .map((p) => (path.isAbsolute(p) ? p : path.join(process.cwd(), p)))
    .map((p) => {
      const pkg = require(path.join(p, 'package.json'));
      return {
        path: p,
        name: pkg.name,
        pkg,
      };
    });
};

// Get all muse library plugins
// const getMuseLibs = () => {
//   return Object.keys({
//     ...pkgJson.dependencies,
//     ...pkgJson.devDependencies,
//     ...pkgJson.peerDependencies,
//   }).filter((dep) => {
//     try {
//       const depPkgJson = require(resolveCwd(`${dep}/package.json`));
//       return depPkgJson?.muse?.type === 'lib';
//     } catch (error) {
//       // NOTE: a lib plugin must exports package.json
//       /* if we can't read the package.json (maybe due to an "exports" section that does not explicitly export ./package.json),
//          we just ignore it to avoid a monumental crash */
//       // console.error(
//       //   `Error while reading ${dep}/package.json file. Either the module is not available, or the 'exports' section does not explicitly export ./package.json`,
//       // );
//       return false;
//     }
//   });
// };

// Get all installed libs, including which from MUSE_LOCAL_PLUGINS if isDev.
// Note that local plugins order matters, it decides which lib version has higher priority
const getMuseLibs = (folder, includeLocal) => {
  const localPlugins = getLocalPlugins();
  const museLibs = getMuseLibsByFolder(folder || process.cwd());

  if (isDev || includeLocal) {
    // Only at dev time, it handles MUSE_LOCAL_PLUGINS
    localPlugins.forEach((lp) => {
      const lpMuseLibs = getMuseLibsByFolder(lp.path);
      lpMuseLibs.forEach((museLib) => {
        if (_.find(museLibs, { name: museLib.name })) return;
        museLibs.push(museLib);
      });
    });
  }
  return museLibs;
};

const getMuseLibsByFolder = (pluginRoot) => {
  let pkg = pkgJson;
  if (pluginRoot) {
    pkg = fs.readJsonSync(path.join(pluginRoot, 'package.json'));
  }
  return Object.keys({
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  })
    .map((dep) => {
      try {
        const pkgPath = resolveFrom(pluginRoot || process.cwd(), `${dep}/package.json`);
        const depPkgJson = fs.readJsonSync(pkgPath);
        if (depPkgJson?.muse?.type === 'lib') {
          return {
            name: dep,
            version: depPkgJson.version,
            path: path.dirname(pkgPath),
            pkg: depPkgJson,
          };
        } else return null;
      } catch (error) {
        // NOTE: a lib plugin must exports package.json
        /* if we can't read the package.json (maybe due to an "exports" section that does not explicitly export ./package.json), 
         we just ignore it to avoid a monumental crash */
        // console.error(
        //   `Error while reading ${dep}/package.json file. Either the module is not available, or the 'exports' section does not explicitly export ./package.json`,
        // );
        return null;
      }
    })
    .filter(Boolean);
};

const assertPath = (object, p, value, notSetIfExist) => {
  const arr = p.split('.');
  while (arr.length > 1) {
    const s = arr.shift();
    if (!object[s]) object[s] = {};
    object = object[s];
  }
  if (!notSetIfExist || !object[arr[0]]) object[arr[0]] = value || {};
};

const getPkgJson = () => {
  return fs.readJsonSync(path.join(process.cwd(), './package.json'));
};

module.exports = {
  getLocalPlugins,
  getMuseLibs,
  // getAllMuseLibs,
  getMuseLibsByFolder,
  assertPath,
  getPkgJson,
};
