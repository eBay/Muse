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

  // Only at dev time, it handles MUSE_LINKED_LIBS
  if (process.env.MUSE_LINKED_LIBS && isDev) {
    process.env.MUSE_LINKED_LIBS.split(';').forEach((ll) => {
      ll = ll.trim();
      if (!path.isAbsolute(ll)) {
        ll = path.join(process.cwd(), ll);
      }
      const pkg = fs.readJsonSync(path.join(ll, 'package.json'));
      const lib = {
        name: pkg.name,
        version: pkg.version,
        isLinked: true,
        path: ll,
        pkg,
      };
      const existing = _.find(museLibs, { name: lib.name });
      if (existing) {
        Object.assign(existing, lib);
      } else {
        museLibs.push(lib);
      }
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

//
const getEntryFile = (dir) => {
  if (!dir) dir = process.cwd();
  const pkg = fs.readJsonSync(path.join(dir, 'package.json'));
  if (pkg.muse?.entry) return pkg.muse?.entry;
  const possibleEntries = [
    'src/index.js',
    'src/main.js',
    'src/index.jsx',
    'src/main.jsx',
    'src/index.ts',
    'src/main.ts',
    'src/index.tsx',
    'src/main.tsx',
  ];
  for (const entry of possibleEntries) {
    if (fs.existsSync(path.join(dir, entry))) return entry;
  }
  return null;
};

module.exports = {
  getLocalPlugins,
  getMuseLibs,
  // getAllMuseLibs,
  getMuseLibsByFolder,
  assertPath,
  getPkgJson,
  getEntryFile,
};
