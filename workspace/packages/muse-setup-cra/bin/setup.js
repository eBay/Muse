#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const spawn = require('cross-spawn');

// Detect package manager, we only support npm, yarn or pnpm.
const pkgManagers = {
  npm: 'package-lock.json',
  pnpm: 'pnpm-lock.yaml',
  yarn: 'yarn.lock',
};

const getPkgMgr = () => {
  const pmStatus = Object.entries(pkgManagers)
    .map(([name, lockFile]) => {
      return fs.existsSync(lockFile) ? name : null;
    })
    .filter(Boolean);

  if (pmStatus.length === 0) {
    return 'npm';
  } else if (pmStatus.length > 1) {
    throw new Error(
      `Multiple lock files found: ${pmStatus.join(
        ', ',
      )}. There should be one package manager for one project.`,
    );
  }

  return pmStatus[0];
};

const timestamp = () => {
  const now = new Date();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const ms = now.getMilliseconds();
  const padding = (t, l) => (String(t).length >= l ? t : '0' + t);
  return `${padding(m, 2)}:${padding(s, 2)}.${padding(ms, 3)}`;
};
const log = {
  info: (s) => {
    console.log(chalk.cyan(timestamp() + ' ' + s));
  },
  success: (s) => {
    console.log(chalk.green(s));
  },
  error: (s) => {
    console.log(chalk.red(s));
  },
};

const execSync = (cmd) => {
  const arr = cmd.split(' ');

  const child = spawn.sync(arr[0], arr.slice(1), { stdio: 'inherit' });

  if (child.signal) {
    if (child.signal === 'SIGKILL') {
      console.log(`
                  The build failed because the process exited too early.
                  This probably means the system ran out of memory or someone called
                  \`kill -9\` on the process.
              `);
    } else if (child.signal === 'SIGTERM') {
      console.log(`
                  The build failed because the process exited too early.
                  Someone might have called  \`kill\` or \`killall\`, or the system could
                  be shutting down.
              `);
    }

    throw new Error(`Failed to execute: ${cmd}`);
  }

  if (child.error) {
    log.error(`Failed to execute: ${cmd}`);
    throw child.error;
  }
};

const mapFile = (p) => path.join(__dirname, '..', p);
(async () => {
  try {
    const pkgMgr = getPkgMgr();
    log.info(`Package manager: ${pkgMgr}.`);

    if (pkgMgr === 'pnpm') {
      log.info(`Init pnpm...`);
      // Config npmrc for pnpm
      fs.copyFileSync(mapFile('./templates/.npmrc'), './.npmrc');
      // Ensure "shamefully-hoist=true" in .npmrc takes effect.
      execSync('pnpm install');
    }

    // Install deps
    log.info('Installing Muse dependencies...');

    const devDeps = [
      'cross-env',
      '@craco/craco@7.1.0',
      '@ebay/muse-core',
      '@ebay/muse-cra-patch',
      '@ebay/muse-craco-plugin',
      'react-scripts@5.0.1',
    ];

    const deps = ['js-plugin', '@ebay/muse-lib-react'];

    execSync(
      `${pkgMgr} add ${devDeps.join(' ')}${
        pkgMgr === 'npm' ? '  --save-dev --legacy-peer-deps' : '  --dev'
      }`,
    );

    execSync(`${pkgMgr} add ${deps.join(' ')}${pkgMgr === 'npm' ? '  --legacy-peer-deps' : ''}`);

    // Update package.json
    const pkgJson = fs.readJsonSync('./package.json');
    log.info('Adding muse config to package.json...');
    pkgJson.muse = {
      type: 'normal',
      devConfig: {
        app: 'myapp',
      },
    };
    log.info('Updating scripts in package.json...');
    Object.assign(pkgJson.scripts, {
      start: 'muse-cra-patch && craco start',
      build: 'muse-cra-patch && craco build ',
      'build:dist': 'muse-cra-patch && craco build',
      'build:dev': 'muse-cra-patch && cross-env MUSE_DEV_BUILD=true FAST_REFRESH=false craco build',
      'build:test':
        'muse-cra-patch && cross-env MUSE_TEST_BUILD=true FAST_REFRESH=false craco build',
      test:
        'muse-cra-patch && cross-env MUSE_TEST_BUILD=true craco test --ci --watchAll=false --passWithNoTests --coverage',
      'test:dev': 'muse-cra-patch && cross-env MUSE_TEST_BUILD=true craco test --coverage',
    });
    fs.writeJsonSync('./package.json', pkgJson, { spaces: 2 });

    // Add craco config
    fs.copyFileSync(mapFile('./templates/craco.config.js'), './craco.config.js');

    // Create muse-lib-react based files.
    const indexJs = fs
      .readFileSync(mapFile('./templates/index.js'))
      .toString()
      .replace('<mypluginname>', pkgJson.name);
    fs.writeFileSync('./src/index.js', indexJs);
    fs.copyFileSync(mapFile('./templates/route.js'), './src/route.js');
    fs.copyFileSync(mapFile('./templates/reducer.js'), './src/reducer.js');
    fs.ensureDirSync('./src/ext');
    fs.createFileSync('./src/ext/index.js');

    // Delete public/index.html
    fs.removeSync('./public/index.html');
    log.success('✨ Succeeded to setup Muse.');
  } catch (err) {
    log.error('Failed to setup Muse.');
    throw err;
  }
})();
