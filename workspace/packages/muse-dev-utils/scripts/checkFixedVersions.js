const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const utils = require('../lib/utils');
const { parseMuseId } = require('@ebay/muse-modules');

/**
 * Should only run this script after build.
 */

console.log('Checking deps versions...');
const libs = {};
const distLibManifest = fs.readJsonSync(path.join(process.cwd(), `./build/dist/lib-manifest.json`));
const devLibManifest = fs.readJsonSync(path.join(process.cwd(), `./build/dev/lib-manifest.json`));
Object.keys({ ...distLibManifest.content, ...devLibManifest.content }).forEach((mid) => {
  const m = parseMuseId(mid);
  libs[m.name] = m.version.join('.');
});
// console.log(libs);
const pkgJson = utils.getPkgJson();

const invalidDeps = {};
[pkgJson.dependencies, pkgJson.devDependencies, pkgJson.peerDependencies].forEach((deps) => {
  Object.keys(libs).forEach((name) => {
    if (deps && deps[name] && deps[name] !== libs[name]) {
      invalidDeps[name] = deps[name];
    }
  });
});

const error = (msg) => console.log(chalk.red(msg));

if (Object.keys(invalidDeps).length) {
  error('Invalid Muse lib dependencies:');
  error(' 1. Shared dependencies should use fixed versions.');
  error(' 2. The versions in build result should be the same as the ones in lib plugins.');
  console.log('');
  error('Please fix:');
  Object.entries(invalidDeps).forEach(([name, version]) => {
    error(` - ${name}: ${version} -> ${libs[name]}`);
  });
  error('✖ Deps versions check failed.');
} else {
  console.log('✔ Deps versions check passed: all sharing deps use correct fixed versions.');
}
