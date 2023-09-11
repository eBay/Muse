const fs = require('fs-extra');
const _ = require('lodash');
const resolveCwd = require('resolve-cwd');
const chalk = require('chalk');
const utils = require('../lib/utils');
const { parseMuseId } = require('@ebay/muse-modules');

// A plugin project should not specify a different version of some dep which is already specified
// in some lib plugin. This script checks if there is any such case.

console.log('Checking deps compatibility...');

const libs = {};
utils
  .getMuseLibs()
  .map((lib) => lib.name)
  .forEach((lib) => {
    const libManifest = fs.readJsonSync(resolveCwd(`${lib}/build/dist/lib-manifest.json`));
    Object.keys(libManifest.content).forEach((mid) => {
      const m = parseMuseId(mid);
      const vObj = { from: lib, version: m.version.join('.') };
      if (libs[m.name]) libs[m.name].push(vObj);
      else libs[m.name] = [vObj];
      libs[m.name] = _.uniqBy(libs[m.name], (o) => o.version);
    });
  });

// console.log(libs);

const invalidDeps = [];
const pkgJson = utils.getPkgJson();
const customLibs = pkgJson.muse?.customLibs || [];
[pkgJson.dependencies, pkgJson.devDependencies, pkgJson.peerDependencies].forEach((deps) => {
  Object.entries(deps || {}).forEach(([name, version]) => {
    if (customLibs.includes(name)) return;
    if (libs[name] && !libs[name].find((o) => o.version === version.replace(/^[^0-9]*/, ''))) {
      invalidDeps.push({ name, version, shouldBe: libs[name] });
    }
  });
});

const error = (msg) => console.log(chalk.red(msg));
if (invalidDeps.length > 0) {
  error('Invalid Muse dependencies in package.json:');
  invalidDeps.forEach(({ name, version, shouldBe }) => {
    error(
      ` - ${name}@${version} -> ${shouldBe
        ?.map((o) => `${o.version} from ${o.from}`)
        .join(' or ')}.`,
    );
  });
  error(
    'Versions of dependencies in package.json should not be different from which in lib plugins.',
  );

  error('✖ Muse deps check failed.');
  process.exit(1);
} else {
  console.log('✔ Muse deps check passed.');
}
