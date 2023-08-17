const fs = require('fs-extra');
const _ = require('lodash');
const resolveCwd = require('resolve-cwd');
const utils = require('./utils');

function parseMuseId(museId) {
  try {
    const m = /((^@[^/]+\/)?([^@/]+))@(\d+)\.(\d+)\.(\d+)([^./][^/]*)?\/(.+)$/.exec(museId);
    if (!m) return null;
    return {
      name: m[1],
      path: m[8],
      id: `${m[1]}/${m[8]}`,
      museId,
      version: m.slice(4, 7).map(Number),
    };
  } catch (err) {
    return null;
  }
}

// A plugin project should not specify a different version
// of some dep which is already specified in some lib plugin.
// This function checks if there is any such case.
function checkLibDeps(type = 'dev') {
  // get all lib plugins
  const libs = {};
  utils.getMuseLibs().forEach((lib) => {
    const libManifest = fs.readJsonSync(resolveCwd(`${lib}/build/${type}/lib-manifest.json`));
    Object.keys(libManifest.content).forEach((mid) => {
      const m = parseMuseId(mid);
      const vObj = { from: lib, version: m.version.join('.') };
      if (libs[m.name]) libs[m.name].push(vObj);
      else libs[m.name] = [vObj];
      libs[m.name] = _.uniqBy(libs[m.name], (o) => o.version);
    });
  });

  console.log(libs);

  const pkgJson = utils.getPkgJson();
  const customLibs = pkgJson.muse?.customLibs || [];
  [pkgJson.dependencies, pkgJson.devDependencies, pkgJson.peerDependencies].forEach((deps) => {
    Object.entries(deps || {}).forEach(([name, version]) => {
      if (customLibs.includes(name)) return;
      if (libs[name] && !libs[name].find((o) => o.version === version.replace(/^[^0-9]*/, ''))) {
        throw new Error(
          `Invalid Muse dependencies: all specified dependencies in package.json \
should not be different with which in lib plugins. \
Found ${name}@${version} in package.json but it should be ${libs[name]
            ?.map((o) => `${o.version} from ${o.from}`)
            .join(' or ')}./
          `,
        );
      }
    });
  });
}

// All deps in lib plugins should use fixed versions.
// This check should be used after build.
function ensureAllLibDepsUseFixedVersions(type = 'dev') {
  const libs = {};

  const libManifest = fs.readJsonSync(resolveCwd(`build/${type}/lib-manifest.json`));
  Object.keys(libManifest.content).forEach((mid) => {
    const m = parseMuseId(mid);
    libs[m.name] = true;
  });

  console.log(libs);
  const pkgJson = utils.getPkgJson();

  const invalidDeps = {};
  [(pkgJson.dependencies, pkgJson.devDependencies, pkgJson.peerDependencies)].forEach((deps) => {
    Object.keys(libs).forEach((name) => {
      if (!deps[name].test(/^\d/)) {
        invalidDeps[name] = deps[name];
      }
    });
  });

  if (Object.keys(invalidDeps).length) {
    throw new Error(
      `Invalid Muse lib dependencies: all lib dependencies should be fixed versions. Please fix:\n ${JSON.stringify(
        invalidDeps,
        null,
        2,
      )}`,
    );
  }
}

ensureAllLibDepsUseFixedVersions();
module.exports = { checkLibDeps, ensureAllLibDepsUseFixedVersions };
