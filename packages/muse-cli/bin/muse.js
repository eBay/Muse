#!/usr/bin/env node

const chalk = require('chalk');
const muse = require('muse-core');
const fs = require('fs');
const path = require('path');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const timeStart = Date.now();
const os = require('os');

const asyncDeployPlugin = async ({ appName, envName, pluginName, version }) => {
  const res = await muse.pm.deployPlugin({ appName, envName, pluginName, version });
  console.log(chalk.cyan(`Deploy success: ${pluginName}@${res.version} to ${appName}/${envName}.`));
};

console.error = (message) => console.log(chalk.red(message));
(async () => {
  const cmd = process.argv[2];
  const args = process.argv.slice(3);
  console.log(chalk.blue('Muse: ' + (cmd || 'version')));

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
      const [appName] = args;
      const fullApp = await muse.data.get(`muse.app.${appName}`);
      console.log(chalk.cyan(JSON.stringify(fullApp, null, 2)));
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
      muse.pm
        .checkDependencies({ appName, envName, pluginName, version })
        .then((dependencyCheckResult) => {
          if (dependencyCheckResult && Object.keys(dependencyCheckResult).length > 0) {
            // missing dependencies detected, confirm with user to continue
            const rl = readline.createInterface({ input, output });
            console.log(
              'WARNING: Detected non-satisfied module dependencies from the following library plugins:',
            );
            for (const library of Object.keys(dependencyCheckResult)) {
              console.log(`${library} => [${dependencyCheckResult[library]}] not found`);
            }
            console.log(os.EOL);
            rl.question('Do you want to continue (yes/no)? [Y]', (answer) => {
              if (
                answer.length === 0 ||
                answer.toLowerCase() === 'yes' ||
                answer.toLowerCase() === 'y'
              ) {
                asyncDeployPlugin({ appName, envName, pluginName, version });
              }
              rl.close();
            });
          } else {
            // no missing dependencies, deploy right away
            asyncDeployPlugin({ appName, envName, pluginName, version });
          }
        });
      break;
    }
    case 'undeploy':
    case 'undeploy-plugin': {
      const [appName, envName, pluginName] = args;
      await muse.pm.undeployPlugin({ appName, envName, pluginName });
      console.log(chalk.cyan(`Undeploy success: ${pluginName} from ${appName}/${envName}.`));

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

    case 'request-deploy': {
      const [appName, envName, pluginName, version] = args;
      await muse.req.createRequest({
        type: 'deploy-plugin',
        payload: { appName, envName, pluginName, version },
      });
      break;
    }

    case 'approve-status':
    case 'merge-request': {
      break;
    }

    case 'serve': {
      const [appName, envName = 'staging', port = 6070] = args;
      if (!appName) throw new Error('App anem is required.');
      require('muse-simple-server/lib/server')({ appName, envName, port });
      break;
    }

    case '-v':
    case 'version':
    case undefined: {
      console.log(chalk.cyan(`Muse CLI version ${require('../package.json').version}.`));
      console.log(chalk.cyan(`Muse core version ${require('muse-core/package.json').version}.`));
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
