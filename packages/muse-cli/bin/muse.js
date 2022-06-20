#!/usr/bin/env node
const { Command } = require('commander');
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

console.error = (message) => console.log(chalk.red(message));

const confirmAnswer = (answer) => {
  return answer.length === 0 || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
};

const program = new Command();
program
  .name('muse')
  .description('MUSE CLI tool for managing MUSE plugins')
  .version(
    require('../package.json').version,
    '-v, --version',
    'outputs the current MUSE CLI version',
  );

program
  .command('info')
  .description('Shows MUSE core/CLI version')
  .action(() => {
    console.log(chalk.cyan(`Muse CLI version ${require('../package.json').version}.`));
    console.log(chalk.cyan(`Muse core version ${require('muse-core/package.json').version}.`));
  });

program
  .command('list-apps')
  .description('List existing applications')
  .action(async () => {
    const apps = await muse.am.getApps();
    console.log(chalk.cyan(`Apps (${apps.length}):`));
    apps.forEach((app) => {
      console.log(chalk.cyan(` - ${app.name}`));
    });
  });

program
  .command('list-plugins')
  .description('List existing plugins')
  .action(async () => {
    const plugins = await muse.pm.getPlugins();
    console.log(chalk.cyan(`Plugins (${plugins.length}):`));
    plugins.forEach((p) => {
      console.log(chalk.cyan(` - ${p.name}`));
    });
  });

program
  .command('show-config')
  .description('Shows MUSE config')
  .action(() => {
    const filepath = muse.config?.filepath;
    if (!filepath) {
      console.log(chalk.cyan('No config.'));
    } else {
      console.log(chalk.cyan(`Config file: ${filepath}`));
      console.log(fs.readFileSync(filepath).toString());
    }
  });

program
  .command('show-data')
  .description('Shows data from a key')
  .argument('<key>', 'data key')
  .action(async (key) => {
    if (!key) throw new Error('Data key is required.');
    const data = await muse.data.get(key);
    if (data) {
      console.log(chalk.cyan(`${key}:\r\n${JSON.stringify(data, null, 2)}`));
    } else {
      console.log(chalk.yellow('Not found: ' + key));
    }
  });

program
  .command('serve')
  .description('Serves a MUSE application environment')
  .argument('<appName>', 'application name')
  .argument('[envName]', 'environment name', 'staging')
  .argument('[port]', 'port', 6070)
  .action((appName, envName, port) => {
    if (!appName) throw new Error('App name is required.');
    require('muse-simple-server/lib/server')({ appName, envName, port });
  });

program
  .command('refresh-data-cache')
  .description('Refreshes a cache key')
  .argument('<key>', 'cache key')
  .action(async (key) => {
    if (!key) throw new Error('Data key is required.');
    await muse.data.refreshCache(key);
  });

program
  .command('create-app')
  .description('Creates a new MUSE application')
  .argument('<appName>', 'application name')
  .action(async (appName) => {
    await muse.am.createApp({ appName });
  });

program
  .command('view-app')
  .description('Views a MUSE application details')
  .argument('<appName>', 'application name')
  .action(async (appName) => {
    const app = await muse.am.getApp(appName);
    console.log(chalk.cyan(JSON.stringify(app, null, 2)));
  });

program
  .command('view-full-app')
  .description('Views a MUSE application full details')
  .argument('<appName>', 'application name')
  .action(async (appName) => {
    const fullApp = await muse.data.get(`muse.app.${appName}`);
    console.log(chalk.cyan(JSON.stringify(fullApp, null, 2)));
  });

program
  .command('create-env')
  .description('Creates a MUSE application environment')
  .argument('<appName>', 'application name')
  .argument('<envName>', 'environment name')
  .action(async (appName, envName) => {
    await muse.am.createEnv({ appName, envName });
  });

program
  .command('del-env')
  .alias('delete-env')
  .description('Deletes a MUSE application environment')
  .argument('<appName>', 'application name')
  .argument('<envName>', 'environment name')
  .action(async (appName, envName) => {
    // should we prompt user to confirm before deleting ?
    const rl = readline.createInterface({ input, output });
    const answer = await new Promise((resolve) =>
      rl.question(
        'ATTENTION !! This operation cannot be undone. Confirm environment deletion (yes/no) [Y] ? ',
        resolve,
      ),
    );
    rl.close();
    if (confirmAnswer(answer)) {
      await muse.am.deleteEnv({ appName, envName });
      console.log(chalk.cyan(`Environment: ${appName}/${envName} deleted successfully.`));
    } else {
      console.log(chalk.cyan(`Command ABORTED.`));
    }
  });

program
  .command('create-plugin')
  .description('Creates a new MUSE plugin')
  .argument('<pluginName>', 'plugin name')
  .action(async (pluginName) => {
    await muse.pm.createPlugin({ pluginName });
  });

program
  .command('del-plugin')
  .alias('delete-plugin')
  .description('Deletes a MUSE plugin')
  .argument('<pluginName>', 'plugin name')
  .action(async (pluginName) => {
    const rl = readline.createInterface({ input, output });
    const answer = await new Promise((resolve) =>
      rl.question(
        'ATTENTION !! This operation cannot be undone. Confirm plugin deletion (yes/no) [Y] ? ',
        resolve,
      ),
    );
    rl.close();
    if (confirmAnswer(answer)) {
      await muse.pm.deletePlugin({ pluginName });
      console.log(chalk.cyan(`Plugin: ${pluginName} deleted successfully.`));
    } else {
      console.log(chalk.cyan(`Command ABORTED.`));
    }
  });

program
  .command('list-deployed-plugins')
  .description('List deplpyed plugins on a MUSE application environment')
  .argument('<appName>', 'application name')
  .argument('<envName>', 'environment name')
  .action(async (appName, envName) => {
    const plugins = await muse.pm.getDeployedPlugins(appName, envName);
    console.log(chalk.cyan(`Deployed plugins on ${appName}/${envName} (${plugins.length}):`));
    plugins.forEach((p) => {
      console.log(chalk.cyan(` - ${p.name}@${p.version}`));
    });
  });

program
  .command('deploy')
  .alias('deploy-plugin')
  .description('Deploys a plugin/version on a MUSE application environment')
  .argument('<appName>', 'application name')
  .argument('<envName>', 'environment name')
  .argument('<pluginName>', 'plugin name')
  .argument('<version>', 'plugin version')
  .action(async (appName, envName, pluginName, version) => {
    const dependencyCheckResult = await muse.pm.checkDependencies({
      appName,
      envName,
      pluginName,
      version,
    });

    const confirmDeployment = true;
  
    if (
      dependencyCheckResult &&
      (Object.keys(dependencyCheckResult['dev']).length > 0 ||
        Object.keys(dependencyCheckResult['dist']).length > 0)
    ) {
      // missing dependencies detected on either dev/dist, confirm with user to continue
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
        console.log(chalk.cyan(`Command ABORTED.`));
        confirmDeployment = false;
      }
    }
    // no missing dependencies or confirm deploy, deploy right away
    if (confirmDeployment) {
      const res = await muse.pm.deployPlugin({ appName, envName, pluginName, version });
      console.log(
        chalk.cyan(`Deploy success: ${pluginName}@${res.version} to ${appName}/${envName}.`),
      );
    }
  });

program
  .command('request-deploy')
  .description('Requests to deploy a plugin/version on a MUSE application environment')
  .argument('<appName>', 'application name')
  .argument('<envName>', 'environment name')
  .argument('<pluginName>', 'plugin name')
  .argument('<version>', 'plugin version')
  .action(async (appName, envName, pluginName, version) => {
    await muse.req.createRequest({
      type: 'deploy-plugin',
      payload: { appName, envName, pluginName, version },
    });
  });

program
  .command('undeploy')
  .alias('undeploy-plugin')
  .description('Deploys a plugin/version on a MUSE application environment')
  .argument('<appName>', 'application name')
  .argument('<envName>', 'environment name')
  .argument('<pluginName>', 'plugin name')
  .action(async (appName, envName, pluginName) => {
    const rl = readline.createInterface({ input, output });
    const answer = await new Promise((resolve) =>
      rl.question(
        'ATTENTION !! This operation cannot be undone. Confirm plugin undeployment (yes/no) [Y] ? ',
        resolve,
      ),
    );
    rl.close();
    if (confirmAnswer(answer)) {
      await muse.pm.undeployPlugin({ appName, envName, pluginName });
      console.log(chalk.cyan(`Undeploy success: ${pluginName} from ${appName}/${envName}.`));
    } else {
      console.log(chalk.cyan(`Command ABORTED.`));
    }
  });

program
  .command('release')
  .alias('release-plugin')
  .description('Releases a plugin version')
  .argument('<pluginName>', 'plugin name')
  .argument('[version]', 'plugin version', 'patch')
  .action(async (pluginName, version) => {
    const buildDir = path.join(process.cwd(), 'build');
    const r = await muse.pm.releasePlugin({
      pluginName,
      version,
      buildDir: fs.existsSync(buildDir) ? buildDir : null,
    });
    console.log(chalk.cyan(`Plugin released ${r.pluginName}@${r.version}`));
  });

program
  .command('del-release')
  .alias('delete-release')
  .description('Deletes a plugin release version')
  .argument('<pluginName>', 'plugin name')
  .argument('<version>', 'plugin version')
  .option('-d, --delAssets', 'delete associated assets (not just unregister release)')
  .action(async (pluginName, version, options) => {
    const rl = readline.createInterface({ input, output });
    const answer = await new Promise((resolve) =>
      rl.question(
        'ATTENTION !! This operation cannot be undone. Confirm delete plugin release (yes/no) [Y] ? ',
        resolve,
      ),
    );
    rl.close();
    if (confirmAnswer(answer)) {
      await muse.pm.deleteRelease({
        pluginName,
        version,
        delAssets: options.delAssets,
      });
      console.log(
        !options.delAssets
          ? chalk.cyan(
              `Plugin release version unregistered (assets still available): ${pluginName}@${version}`,
            )
          : chalk.cyan(
              `Plugin release version deleted (including corresponding assets): ${pluginName}@${version}`,
            ),
      );
    } else {
      console.log(chalk.cyan(`Command ABORTED.`));
    }
  });

program
  .command('list-released-assets')
  .description('List released assets of a plugin version')
  .argument('<pluginName>', 'plugin name')
  .argument('<version>', 'plugin version')
  .action(async (pluginName, version) => {
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
  });

program
  .parseAsync(process.argv)
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
