#!/usr/bin/env node

const chalk = require('chalk');
const muse = require('muse-core');
const fs = require('fs');
const path = require('path');

const timeStart = Date.now();

console.error = (message) => console.log(chalk.red(message));
(async () => {
  const cmd = process.argv[2];
  const args = process.argv.slice(3);
  console.log(chalk.blue('Muse: ' + cmd));

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

    case 'view-app': {
      const [appName] = args;
      const app = await muse.am.getApp(appName);
      console.log(chalk.cyan(JSON.stringify(app, null, 2)));
      break;
    }

    case 'view-full-app': {
      break;
    }
    case 'create-env': {
      const [appName, envName] = args;
      await muse.am.createEnv({ appName, envName });
      break;
    }

    case 'create-plugin': {
      const [pluginName] = args;
      await muse.pm.createPlugin({ pluginName });
      break;
    }

    case 'list-plugins': {
      const plugins = await muse.pm.getPlugins();
      console.log(chalk.cyan(`Plugins (${plugins.length}):`));
      plugins.forEach((p) => {
        console.log(chalk.cyan(` - ${p.name}`));
      });
      break;
    }

    case 'list-deployed-plugins': {
      const [appName, envName] = args;
      const plugins = await muse.pm.getDeployedPlugins(appName, envName);
      console.log(chalk.cyan(`Deployed plugins on ${appName}/${envName} (${plugins.length}):`));
      plugins.forEach((p) => {
        console.log(chalk.cyan(` - ${p.name}@${p.version}`));
      });
      break;
    }
    case 'deploy':
    case 'deploy-plugin': {
      const [appName, envName, pluginName, version] = args;
      const res = await muse.pm.deployPlugin({ appName, envName, pluginName, version });
      console.log(chalk.cyan(`Deploy success: ${pluginName}@${res.version} to ${appName}/${envName}.`));
      break;
    }
    case 'release':
    case 'release-plugin': {
      const [pluginName, version = 'patch'] = args;
      const buildDir = path.join(process.cwd(), 'build');
      const r = await muse.pm.releasePlugin({
        pluginName,
        version,
        buildDir: fs.existsSync(buildDir) ? buildDir : null,
      });
      console.log(chalk.cyan(`Plugin released ${r.pluginName}@${r.version}`));
      break;
    }

    case undefined: {
      console.log(chalk.cyan(`Muse version ${require('../package.json').version}.`));
      break;
    }
    default:
      throw new Error(`Unknown command ${cmd}`);
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
