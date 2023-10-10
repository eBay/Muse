import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import chalk from 'chalk';
import * as url from 'url';
import pkgJson from 'package-json';
import spawn from 'cross-spawn';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// const pkgJson = require(path.join(process.cwd(), './package.json'));

export default async function checkUpdate() {
  console.log(chalk.cyan('Checking update...'));
  const selfPkg = fs.readJsonSync(path.join(__dirname, '../package.json'));

  const publishedPkg = await pkgJson(selfPkg.name, {
    registryUrl: 'https://npm.corp.ebay.com',
  });

  if (semver.lt(selfPkg.version, publishedPkg.version)) {
    console.log(chalk.yellow(`Found new version: ${publishedPkg.version}, updating...`));
    spawn.sync(
      'npm',
      [
        'install',
        `${selfPkg.name}@${publishedPkg.version}`,
        '-g',
        '--registry=https://npm.corp.ebay.com',
      ],
      {
        stdio: 'inherit',
      },
    );
    console.log(chalk.green('Updated successfully!'));
  } else {
    console.log(chalk.green('Already up to date!'));
  }
}
