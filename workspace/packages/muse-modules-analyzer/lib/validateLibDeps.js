const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const resolveCwd = require('resolve-cwd');
// const utils = require('./utils');
const devUtils = require('@ebay/muse-dev-utils');

// function parseMuseId(museId) {
//   try {
//     const m = /((^@[^/]+\/)?([^@/]+))@(\d+)\.(\d+)\.(\d+)([^./][^/]*)?\/(.+)$/.exec(museId);
//     if (!m) return null;
//     return {
//       name: m[1],
//       path: m[8],
//       id: `${m[1]}/${m[8]}`,
//       museId,
//       version: m.slice(4, 7).map(Number),
//     };
//   } catch (err) {
//     return null;
//   }
// }

module.exports = function validateLibDeps(folder = process.cwd()) {
  const pkgJson = fs.readJsonSync(path.join(folder, 'package.json'));

  if (pkgJson.muse?.type === 'lib') {
    ensureAllLibDepsUseFixedVersions();
  }
};

/**
 *
 * A plugin project should not specify a different version
 * of some dep which is already specified in some lib plugin.
 * This function checks if there is any such case.
 * @param {*} type
 */
function checkLibDeps(type = 'dev') {
  // get all lib plugins
  const libs = {};
  utils
    .getMuseLibs()
    .map((lib) => lib.name)
    .forEach((lib) => {
      const libManifest = fs.readJsonSync(resolveCwd(`${lib}/build/${type}/lib-manifest.json`));
      Object.keys(libManifest.content).forEach((mid) => {
        const m = parseMuseId(mid);
        const vObj = { from: lib, version: m.version.join('.') };
        if (libs[m.name]) libs[m.name].push(vObj);
        else libs[m.name] = [vObj];
        libs[m.name] = _.uniqBy(libs[m.name], (o) => o.version);
      });
    });

  // console.log(libs);

  const pkgJson = utils.getPkgJson();
  const customLibs = pkgJson.muse?.customLibs || [];
  [pkgJson.dependencies, pkgJson.devDependencies, pkgJson.peerDependencies].forEach((deps) => {
    Object.entries(deps || {}).forEach(([name, version]) => {
      if (customLibs.includes(name)) return;
      if (libs[name] && !libs[name].find((o) => o.version === version.replace(/^[^0-9]*/, ''))) {
        throw new Error(
          `Invalid Muse dependencies: all specified dependencies versions in package.json \
should not be different with which in lib plugins. \
Found ${name}@${version} in package.json but it should be ${libs[name]
            ?.map((o) => `${o.version} from ${o.from}`)
            .join(' or ')}./
          `,
        );
      }
    });
  });
  console.log('✅ Lib deps check passed.');
}

/**
 * All deps in lib plugins should use fixed versions.
 * This check should be used after build so that the build folder exists.
 *
 * @param {*} folder - The plugin folder.
 */
function getUnfixedVersions(folder = process.cwd()) {
  const libs = {};
  const libManifest = fs.readJsonSync(path.join(folder, `./build/dist/lib-manifest.json`));
  Object.keys(libManifest.content).forEach((mid) => {
    const m = parseMuseId(mid);
    libs[m.name] = true;
  });
  // console.log(libs);
  const pkgJson = utils.getPkgJson();

  const invalidDeps = {};
  [pkgJson.dependencies, pkgJson.devDependencies, pkgJson.peerDependencies].forEach((deps) => {
    Object.keys(libs).forEach((name) => {
      if (deps && deps[name] && !/^\d/.test(deps[name])) {
        invalidDeps[name] = deps[name];
      }
    });
  });

  if (Object.keys(invalidDeps).length) {
    throw new Error(
      `Invalid Muse lib dependencies: all lib dependencies should be fixed versions. Please fix:\n\r ${JSON.stringify(
        invalidDeps,
        null,
        2,
      )}`,
    );
  }
  console.log('✅ Deps versions check passed.');
}

// checkLibDeps();
// ensureAllLibDepsUseFixedVersions();
// module.exports = { checkLibDeps, ensureAllLibDepsUseFixedVersions };
