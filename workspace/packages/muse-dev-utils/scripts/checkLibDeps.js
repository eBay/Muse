const fs = require('fs-extra');
const _ = require('lodash');
const resolveCwd = require('resolve-cwd');
const chalk = require('chalk');
const semver = require('semver');
const utils = require('../lib/utils');
const { parseMuseId } = require('@ebay/muse-modules');

// A plugin project should not specify a different version of some dep which is already specified
// in some lib plugin. This script checks if there is any such case.

const pkgJson = utils.getPkgJson();
const pluginType = pkgJson.muse?.type || 'normal';

if (['lib', 'normal'].includes(pluginType)) {
  console.log('Checking deps compatibility...');

  const libs = {};
  utils
    .getMuseLibs()
    .map((lib) => lib.name)
    .forEach((lib) => {
      const distLibManifest = fs.readJsonSync(resolveCwd(`${lib}/build/dist/lib-manifest.json`));
      const devLibManifest = fs.readJsonSync(resolveCwd(`${lib}/build/dev/lib-manifest.json`));
      Object.keys({ ...distLibManifest.content, ...devLibManifest.content }).forEach((mid) => {
        const m = parseMuseId(mid);
        const vObj = { from: lib, version: m.version.join('.') };
        if (libs[m.name]) libs[m.name].push(vObj);
        else libs[m.name] = [vObj];
        libs[m.name] = _.uniqBy(libs[m.name], (o) => o.version);
      });
    });

  const invalidDeps = [];
  const pkgJson = utils.getPkgJson();
  const customLibs = pkgJson.muse?.customLibs || [];
  [pkgJson.dependencies, pkgJson.devDependencies, pkgJson.peerDependencies].forEach((deps) => {
    Object.entries(deps || {}).forEach(([name, version]) => {
      if (customLibs.includes(name)) return;

      if (libs[name] && !libs[name].find((o) => semver.satisfies(o.version, version))) {
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
      'Versions of dependencies in package.json should be compatible with which in lib plugins.',
    );

    error('✖ Muse deps check failed.');
    setTimeout(() => process.exit(1), 300);
  } else {
    console.log(
      chalk.green(
        '✔ Muse deps check passed: all sharing deps are compatible with the ones in lib plugins.',
      ),
    );
  }
}
