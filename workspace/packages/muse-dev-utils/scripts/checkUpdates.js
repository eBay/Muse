const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const spawn = require('cross-spawn');
const semver = require('semver');
const museCore = require('@ebay/muse-core');
const importCwd = require('import-cwd');

const logger = museCore.logger.createLogger('muse-dev-utils');
const pkgJson = require(path.join(process.cwd(), './package.json'));

/**
 * @description Update dependencies in package.json based on the MSP preset specified
 * in "muse.msp". Reads the preset's flattened versions from the muse.msp data key,
 * compares each package's currently installed version against the preset version,
 * and installs any packages that are out of date using the detected package manager.
 * Usage:
 *   muse-dev-utils check-updates
 */
async function checkUpdates() {
  const mspName = pkgJson.muse?.msp || 'origin';
  if (!pkgJson.muse?.msp) {
    logger.info(
      chalk.yellow('No "muse.msp" specified in package.json. Using "origin" preset by default.'),
    );
  }

  logger.info(chalk.cyan(`Checking updates for MSP preset "${mspName}"...`));

  const mspData = await museCore.data.get('muse.msp');
  if (!mspData) {
    throw new Error('msp.yaml does not exist in the registry.');
  }

  const preset = mspData[mspName];
  if (!preset) {
    throw new Error(`MSP preset "${mspName}" not found in msp.yaml.`);
  }

  const { versions } = preset;
  if (!versions || Object.keys(versions).length === 0) {
    logger.info(chalk.yellow(`Preset "${mspName}" has no versions defined. Nothing to do.`));
    return;
  }

  const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };

  const toUpdate = Object.entries(versions)
    .map(([name, version]) => {
      if (!allDeps[name]) return null;
      const installedPkg = importCwd(`${name}/package.json`);
      return installedPkg && semver.lt(installedPkg.version, version) ? `${name}@${version}` : null;
    })
    .filter(Boolean);

  if (toUpdate.length > 0) {
    logger.info(chalk.yellow(`Found ${toUpdate.length} update${toUpdate.length > 1 ? 's' : ''}:`));
    toUpdate.forEach((s) => {
      logger.info(chalk.yellow(`  - ${s}`));
    });
    logger.info(chalk.yellow('Updating...'));
    await updateDeps(toUpdate);
  } else {
    logger.info(chalk.green(`All packages are up to date with preset "${mspName}"!`));
  }

  logger.info(chalk.green('Check updates success.'));
}

const pkgManagers = {
  npm: 'package-lock.json',
  pnpm: 'pnpm-lock.yaml',
  yarn: 'yarn.lock',
};

const getPkgManager = () => {
  const detected = Object.entries(pkgManagers)
    .map(([name, lockFile]) => (fs.existsSync(path.join(process.cwd(), lockFile)) ? name : null))
    .filter(Boolean);

  if (detected.length === 0) {
    throw new Error('No lock files found for npm, yarn or pnpm.');
  } else if (detected.length > 1) {
    throw new Error(
      `Multiple lock files found: ${detected.join(
        ', ',
      )}. There should be one package manager for one project.`,
    );
  }

  return detected[0];
};

async function updateDeps(updates) {
  const pm = getPkgManager();
  const cmd = `${pm} add ${pm === 'npm' ? '--legacy-peer-deps ' : ''}${updates.join(' ')}`;
  const arr = cmd.split(/ +/g);
  const cmd0 = arr.shift();

  const child = spawn.sync(cmd0, arr, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  if (child.status === 1) {
    throw new Error('Failed to update packages.');
  }

  logger.info(chalk.green('All packages were updated successfully!'));
}

module.exports = checkUpdates;
