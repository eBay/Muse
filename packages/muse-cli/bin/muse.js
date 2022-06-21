#!/usr/bin/env node

const chalk = require('chalk');
const muse = require('muse-core');
const fs = require('fs');
const path = require('path');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
// const build = require('../lib/build');
// const start = require('../lib/start');
// const test = require('../lib/test');

const timeStart = Date.now();
const os = require('os');

const confirmAnswer = (answer) => {
  return answer.length === 0 || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
};

console.error = (message) => console.log(chalk.red(message));
(async () => {
  const cmd = process.argv[2];
  const args = process.argv.slice(3);
  console.log(chalk.blue('Muse command: ' + (cmd || 'version')));

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

    case 'del-env':
    case 'delete-env': {
      // should we prompt user to confirm before deleting ?
      const [appName, envName] = args;
      const rl = readline.createInterface({ input, output });
      rl.question(
        'ATTENTION !! This operation cannot be undone. Confirm environment deletion (yes/no) [Y] ? ',
        async (answer) => {
          if (confirmAnswer(answer)) {
            await muse.am.deleteEnv({ appName, envName });
            console.log(chalk.cyan(`Environment: ${appName}/${envName} deleted successfully.`));
          } else {
            console.log(chalk.cyan(`Environment: ${appName}/${envName} deletion ABORTED.`));
          }
          rl.close();
        },
      );
      break;
    }

    case 'create-plugin': {
      const [pluginName] = args;
      await muse.pm.createPlugin({ pluginName });
      break;
    }

    case 'del-plugin':
    case 'delete-plugin': {
      const [pluginName] = args;
      await muse.pm.deletePlugin({ pluginName });
      break;
    }

    case 'list-plugins': {
      const plugins = await muse.pm.getPlugins();
      console.log(chalk.cyan(`Plugins (${plugins.length}):`));
      plugins.forEach((p) => {
        console.log(chalk.cyan(` - ${p?.name}`));
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
      const dependencyCheckResult = await muse.pm.checkDependencies({
        appName,
        envName,
        pluginName,
        version,
      });

      if (
        dependencyCheckResult &&
        (Object.keys(dependencyCheckResult['dev']).length > 0 ||
          Object.keys(dependencyCheckResult['dist']).length > 0)
      ) {
        // // missing dependencies detected on either dev/dist, confirm with user to continue
        const rl = readline.createInterface({ input, output });
        console.log(
          'WARNING: Detected non-satisfied module dependencies from the following library plugins:',
        );
        for (const library of Object.keys(dependencyCheckResult['dev'])) {
          console.log(`(dev) ${library} => [${dependencyCheckResult['dev'][library]}] not found`);
        }
        for (const library of Object.keys(dependencyCheckResult['dist'])) {
          console.log(`(dist) ${library} => [${dependencyCheckResult['dist'][library]}] not found`);
        }
        console.log(os.EOL);
        const answer = await new Promise((resolve) =>
          rl.question('Do you want to continue (yes/no) [Y] ? ', resolve),
        );
        rl.close();
        if (!confirmAnswer(answer)) {
          break;
        }
      }
      // no missing dependencies or confirm deploy, deploy right away
      const res = await muse.pm.deployPlugin({ appName, envName, pluginName, version });
      console.log(
        chalk.cyan(`Deploy success: ${pluginName}@${res.version} to ${appName}/${envName}.`),
      );

      break;
    }
    case 'undeploy':
    case 'undeploy-plugin': {
      const [appName, envName, pluginName] = args;
      await muse.pm.undeployPlugin({ appName, envName, pluginName });
      console.log(chalk.cyan(`Undeploy success: ${pluginName} from ${appName}/${envName}.`));

      break;
    }
    // case 'build':
    //   await build();
    //   break;
    // case 'start':
    //   await start();
    //   break;
    // case 'test':
    //   await test();
    //   break;
    case 'release':
    case 'release-plugin': {
      const [pluginName, version = 'patch'] = args;
      const buildDir = path.join(process.cwd(), 'build');
      const r = await muse.pm.releasePlugin({
        pluginName,
        version,
        buildDir: fs.existsSync(buildDir) ? buildDir : undefined,
      });
      console.log(chalk.cyan(`Plugin released ${r.pluginName}@${r.version}`));
      break;
    }

    case 'unreg-release':
    case 'unregister-release': {
      const [pluginName, version] = args;

      const rl = readline.createInterface({ input, output });
      rl.question(
        'ATTENTION !! This operation cannot be undone. Confirm unregister plugin release (yes/no) [Y] ? ',
        async (answer) => {
          if (confirmAnswer(answer)) {
            await muse.pm.deleteRelease({
              pluginName,
              version,
              delAssets: false,
            });
            console.log(
              chalk.cyan(
                `Plugin release version unregistered (assets still available): ${pluginName}@${version}`,
              ),
            );
          } else {
            console.log(chalk.cyan(`Plugin release version un-registration ABORTED.`));
          }
          rl.close();
        },
      );

      break;
    }

    case 'del-release':
    case 'delete-release': {
      const [pluginName, version] = args;

      const rl = readline.createInterface({ input, output });
      rl.question(
        'ATTENTION !! This operation cannot be undone. Confirm delete plugin release (yes/no) [Y] ? ',
        async (answer) => {
          if (confirmAnswer(answer)) {
            await muse.pm.deleteRelease({
              pluginName,
              version,
              delAssets: true,
            });
            console.log(
              chalk.cyan(
                `Plugin release version deleted (including corresponding assets): ${pluginName}@${version}`,
              ),
            );
          } else {
            console.log(chalk.cyan(`Plugin release version deletion ABORTED.`));
          }
          rl.close();
        },
      );

      break;
    }

    case 'list-released-assets': {
      const [pluginName, version] = args;
      const objectList = await muse.pm.getReleaseAssets({
        pluginName,
        version,
      });
      objectList.forEach((o) => {
        console.log(
          chalk.cyan(
            ` - ${o.name}        ${o.size} bytes        ${new Date(o.mtime).toLocaleString()}`,
          ),
        );
      });
      break;
    }
    case 'show-config': {
      const filepath = muse.config?.filepath;
      if (!filepath) {
        console.log(chalk.cyan('No config.'));
      } else {
        console.log(chalk.cyan(`Config file: ${filepath}`));
        console.log(fs.readFileSync(filepath).toString());
      }
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

    case 'refresh-data-cache': {
      const [key] = args;
      if (!key) throw new Error('Data key is required.');
      await muse.data.refreshCache(key);
      break;
    }

    case 'show-data': {
      const [key] = args;
      if (!key) throw new Error('Data key is required.');
      const data = await muse.data.get(key);
      if (data) {
        console.log(chalk.cyan(`${key}:\r\n${JSON.stringify(data, null, 2)}`));
      } else {
        console.log(chalk.yellow('Not found: ' + key));
      }

      break;
    }

    case 'serve': {
      const [appName, envName = 'staging', port = 6070] = args;
      if (!appName) throw new Error('App name is required.');
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
