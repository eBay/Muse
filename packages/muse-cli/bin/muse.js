#!/usr/bin/env node

import chalk from 'chalk';
import muse from 'muse-core';

const timeStart = Date.now();

console.error = (message) => console.log(chalk.red(message));
(async () => {
  const cmd = process.argv[2];
  const args = process.argv.slice(3);
  console.log('args: ', args);

  switch (cmd) {
    case 'list-apps': {
      const apps = await muse.am.getApps();
      console.log(chalk.cyan(`Apps (${apps.length}):`));
      apps.forEach((app) => {
        console.log(chalk.cyan(` - ${app.name}`));
      });
      break;
    }
    case 'create-app': {
      const [appName] = args;
      await muse.am.createApp({ appName });
      break;
    }
    case 'create-env': {
      const [appName, envName] = args;
      await muse.pm.createEnv({ appName, envName });
    }
    case 'list-plugins': {
      break;
    }
    default:
      throw new Error(`Unknown command ${args[0]}`);
  }
})()
  .then(() => {
    const timeEnd = Date.now();
    const timeSpan = (timeEnd - timeStart) / 1000;
    console.log(chalk.green(`✨ Done in ${timeSpan}s.`));
  })
  .catch((err) => {
    const timeEnd = Date.now();
    const timeSpan = (timeEnd - timeStart) / 1000;

    console.error(err.stack || err.message);
    console.error(`Command failed in ${timeSpan}s.`);
  });
