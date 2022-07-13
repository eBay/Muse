#!/usr/bin/env node
const _ = require('lodash');
const { Command } = require('commander');
const chalk = require('chalk');
const muse = require('@ebay/muse-core');
const fs = require('fs-extra');
const path = require('path');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const inquirer = require('inquirer');
// const plugin = require('js-plugin');
// const build = require('../lib/build');
// const start = require('../lib/start');
// const test = require('../lib/test');
const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');
TimeAgo.addDefaultLocale(en);

const timeAgo = new TimeAgo('en-US');

const timeStart = Date.now();
const os = require('os');

console.error = message => console.log(chalk.red(message));

const confirmAnswer = answer => {
  return answer.length === 0 || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
};

const program = new Command();
program
  .name('muse')
  .description('MUSE CLI tool for managing MUSE deployments')
  .version(
    require('../package.json').version,
    '-v, --version',
    'outputs the current MUSE CLI version',
  );

program
  .command('info')
  .description('Show MUSE core/CLI version')
  .action(() => {
    console.log(chalk.cyan(`Muse CLI version: ${require('../package.json').version}.`));
    console.log(
      chalk.cyan(`Muse core version: ${require('@ebay/muse-core/package.json').version}.`),
    );
    muse.config.filepath && console.log(chalk.cyan(`Muse config file: ${muse.config.filepath}.`));
  });

program
  .command('list-apps')
  .description('List existing applications')
  .action(async () => {
    const apps = await muse.am.getApps();
    console.log(chalk.cyan(`Apps (${apps.length}):`));
    apps.forEach(app => {
      console.log(chalk.cyan(` - ${app.name}`));
    });
  });

program
  .command('list-plugins')
  .description('List existing plugins')
  .action(async () => {
    const plugins = await muse.pm.getPlugins();
    console.log(chalk.cyan(`Plugins (${plugins.length}):`));
    plugins.forEach(p => {
      console.log(chalk.cyan(` - ${p.name}`));
    });
  });

program
  .command('view-config')
  .description('Show MUSE config')
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
  .command('view-data')
  .description('Show cached data from a cache key')
  .argument('<key>', 'data key')
  .action(async key => {
    const data = await muse.data.get(key);
    if (data) {
      console.log(chalk.cyan(`${key}:\r\n${JSON.stringify(data, null, 2)}`));
    } else {
      console.log(chalk.yellow('Not found: ' + key));
    }
  });

program
  .command('serve')
  .description('Serve a MUSE application environment')
  .argument('[appName]', 'application name')
  .argument('[envName]', 'environment name', 'staging')
  .argument('[port]', 'port', 6070)
  .option('--is-dev', 'Start the server to load dev bundles.')
  .option('--by-url', 'Detect app by url.')
  .action((appName, envName, port, options) => {
    require('@ebay/muse-simple-server/lib/server')({ appName, envName, port, ...options });
  });

program
  .command('refresh-data-cache')
  .description('Refresh a cache key')
  .argument('<key>', 'cache key')
  .action(async key => {
    await muse.data.refreshCache(key);
  });

program
  .command('create-app')
  .description('Create a new MUSE application')
  .argument('<appName>', 'application name')
  .option('--args <args...>', 'space separated list of variable names')
  .action(async (appName, options) => {
    const mappedArgs = options.args?.reduce((mappedArgs, option, index, args) => {
      const argObj = option.split('=');
      if (argObj[0] in mappedArgs) {
        mappedArgs[[argObj[0]]] = [..._.castArray(mappedArgs[argObj[0]]), argObj[1]];
      } else {
        mappedArgs[argObj[0]] = argObj[1];
      }
      return mappedArgs;
    }, {});
    await muse.am.createApp({ appName, ...mappedArgs });
  });

program
  .command('delete-app')
  .description('Delete a MUSE application')
  .argument('<appName>', 'application name')
  .action(async appName => {
    const rl = readline.createInterface({ input, output });
    const answer = await new Promise(resolve =>
      rl.question(
        'ATTENTION !! This operation cannot be undone. Confirm application deletion (yes/no) [Y] ? ',
        resolve,
      ),
    );
    rl.close();
    if (confirmAnswer(answer)) {
      await muse.am.deleteApp({ appName });
      console.log(chalk.cyan(`Application: ${appName} deleted successfully.`));
    } else {
      console.log(chalk.cyan(`Command ABORTED.`));
    }
  });

program
  .command('export-app')
  .description('Export a MUSE application')
  .argument('<appName>', 'application name')
  .argument('<envName>', 'env name')
  .argument('<output>', 'output folder name')
  .action(async (appName, envName, output) => {
    await muse.am.export({ appName, envName, output });
  });

program
  .command('view-app')
  .description('Display basic details of a MUSE application')
  .argument('<appName>', 'application name')
  .action(async appName => {
    const app = await muse.am.getApp(appName);
    console.log(chalk.cyan(JSON.stringify(app, null, 2)));
  });

program
  .command('view-full-app')
  .description('Display full details of a MUSE application')
  .argument('<appName>', 'application name')
  .action(async appName => {
    const fullApp = await muse.data.get(`muse.app.${appName}`);
    console.log(chalk.cyan(JSON.stringify(fullApp, null, 2)));
  });

program
  .command('create-env')
  .description('Create a MUSE application environment')
  .argument('<appName>', 'application name')
  .argument('<envName>', 'environment name')
  .action(async (appName, envName) => {
    await muse.am.createEnv({ appName, envName });
  });

program
  .command('del-env')
  .alias('delete-env')
  .description('Delete a MUSE application environment')
  .argument('<appName>', 'application name')
  .argument('<envName>', 'environment name')
  .action(async (appName, envName) => {
    // should we prompt user to confirm before deleting ?
    const rl = readline.createInterface({ input, output });
    const answer = await new Promise(resolve =>
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
  .description('Create a new MUSE plugin')
  .argument('<pluginName>', 'plugin name')
  .option('--args <args...>', 'space separated list of variable names')
  .action(async (pluginName, options) => {
    const mappedArgs = options.args?.reduce((mappedArgs, option, index, args) => {
      const argObj = option.split('=');
      if (argObj[0] in mappedArgs) {
        mappedArgs[[argObj[0]]] = [..._.castArray(mappedArgs[argObj[0]]), argObj[1]];
      } else {
        mappedArgs[argObj[0]] = argObj[1];
      }
      return mappedArgs;
    }, {});
    await muse.pm.createPlugin({ pluginName, ...mappedArgs });
  });

program
  .command('view-plugin')
  .description('View meta of a MUSE plugin')
  .argument('<pluginName>', 'plugin name')
  .action(async pluginName => {
    console.log(chalk.cyan(JSON.stringify(await muse.pm.getPlugin(pluginName), null, 2)));
  });

program
  .command('del-plugin')
  .alias('delete-plugin')
  .description('Delete a MUSE plugin')
  .argument('<pluginName>', 'plugin name')
  .action(async pluginName => {
    const rl = readline.createInterface({ input, output });
    const answer = await new Promise(resolve =>
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
  .description('List deployed plugins on a MUSE application environment')
  .argument('<appName>', 'application name')
  .argument('<envName>', 'environment name')
  .action(async (appName, envName) => {
    const plugins = await muse.pm.getDeployedPlugins(appName, envName);
    console.log(chalk.cyan(`Deployed plugins on ${appName}/${envName} (${plugins.length}):`));
    plugins.forEach(p => {
      console.log(chalk.cyan(` - ${p.name}@${p.version}`));
    });
  });

program
  .command('deploy')
  .alias('deploy-plugin')
  .description('Deploy a plugin version on a MUSE application environment')
  .argument('<appName>', 'application name')
  .argument('[envName]', 'environment name', 'staging')
  .argument('[pluginName]', 'plugin name', null)
  .argument('[version]', 'plugin version')
  .action(async (appName, envName, pluginName, version) => {
    const pkgJson = fs.readJSONSync(path.join(process.cwd(), 'package.json'), {
      throws: false,
    });
    if (!pluginName && pkgJson.muse) {
      pluginName = pkgJson.name;
    } else if (!pluginName) {
      throw new Error(`Plugin name is required.`);
    }

    const dependencyCheckResult = await muse.pm.checkDependencies({
      appName,
      envName,
      pluginName,
      version,
    });

    let confirmDeployment = true;

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
      const answer = await new Promise(resolve =>
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
  .description('Request to deploy a plugin version on a MUSE application environment')
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
  .description('Undeploy a plugin from a MUSE application environment')
  .argument('<appName>', 'application name')
  .argument('<envName>', 'environment name')
  .argument('<pluginName>', 'plugin name')
  .action(async (appName, envName, pluginName) => {
    const rl = readline.createInterface({ input, output });
    const answer = await new Promise(resolve =>
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
  .summary('Releases a plugin')
  .description(
    'Releases a plugin: it registers a release in the Muse registry and uploads content from the "build" folder to the defined static assets storage.',
  )
  .argument(
    '[version]',
    'The version of the release, can be patch, minor, major or a specified version like 1.0.8.',
    'patch',
  )
  .action(async version => {
    const pkgJson = fs.readJSONSync(path.join(process.cwd(), 'package.json'), {
      throws: false,
    });

    if (!pkgJson?.muse) {
      throw new Error(`"muse release" need to be run under a Muse plugin project.`);
    }
    const buildDir = path.join(process.cwd(), 'build');
    if (!buildDir) {
      throw new Error(`No "build" folder found. Please build before release.`);
    }
    console.log('version: ', version);
    const r = await muse.pm.releasePlugin({
      pluginName: pkgJson.name,
      version: version,
      buildDir: buildDir,
    });
    console.log(chalk.cyan(`Plugin released ${r.pluginName}@${r.version}`));
  });

program
  .command('reg-release')
  .alias('register-release')
  .description('Register a plugin release')
  .argument('<pluginName>', 'plugin name')
  .argument('[version]', 'plugin version', 'patch')
  .action(async (pluginName, version) => {
    const r = await muse.pm.releasePlugin({
      pluginName,
      version,
    });
    console.log(chalk.cyan(`Plugin released ${r.pluginName}@${r.version}`));
  });

program
  .command('list-releases')
  .summary('Show releases of a plugin')
  .description('Show releases of a plugin.')
  .argument('<pluginName>', 'The plugin name in the registry.')
  .action(async pluginName => {
    const releases = await muse.pm.getReleases(pluginName);
    console.log(chalk.cyan(JSON.stringify(releases, null, 2)));
  });

program
  .command('del-release')
  .alias('delete-release')
  .summary('Delete a released plugin version')
  .description('Deletes a released plugin version including their uploaded assets')
  .argument('<pluginName>', 'plugin name')
  .argument('<version>', 'plugin version')
  .action(async (pluginName, version) => {
    const rl = readline.createInterface({ input, output });
    const answer = await new Promise(resolve =>
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
      });
      console.log(
        chalk.cyan(
          `Plugin release version deleted (including corresponding assets): ${pluginName}@${version}`,
        ),
      );
    } else {
      console.log(chalk.cyan(`Command ABORTED.`));
    }
  });

program
  .command('unreg-release')
  .alias('unregister-release')
  .description('Unregister a released plugin version')
  .argument('<pluginName>', 'plugin name')
  .argument('<version>', 'plugin version')
  .action(async (pluginName, version) => {
    const rl = readline.createInterface({ input, output });
    const answer = await new Promise(resolve =>
      rl.question(
        'ATTENTION !! This operation cannot be undone. Confirm unregister plugin release (yes/no) [Y] ? ',
        resolve,
      ),
    );
    rl.close();
    if (confirmAnswer(answer)) {
      await muse.pm.unregisterRelease({
        pluginName,
        version,
      });
      console.log(
        chalk.cyan(
          `Plugin release version unregistered (assets still available): ${pluginName}@${version}`,
        ),
      );
    } else {
      console.log(chalk.cyan(`Command ABORTED.`));
    }
  });

program
  .command('list-requests')
  .description('List open requests.')
  .argument('[state]', 'plugin version', null)
  .action(async state => {
    let requests = await muse.req.getRequests();
    if (state) requests = requests.filter(r => r.state === state);
    console.log(chalk.cyan(`Requests (${requests.length}): `));
    requests.forEach(r => {
      console.log(
        chalk.cyan(
          ` - ${r.id} by ${r.createdBy} ${chalk.yellow(
            timeAgo.format(new Date(r.createdAt)),
          )}: ${r.description || ''}`,
        ),
      );
    });
  });

program
  .command('delete-request')
  .alias('del-request')
  .description('Delete a request by id.')
  .argument('<requestId>', 'The request id')
  .action(async requestId => {
    await muse.req.deleteRequest({ requestId });
    console.log(chalk.cyan(`Request deleted.`));
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
    objectList.forEach(o => {
      console.log(
        chalk.cyan(
          ` - ${o.name}        ${o.size} bytes        ${new Date(o.mtime).toLocaleString()}`,
        ),
      );
    });
  });

program
  .command('batch-deploy')
  .description(
    'Undeploy/Deploy multiple plugins on single/mulitple MUSE application environment(s)',
  )
  .arguments('<appName>', 'app name')
  .action(async appName => {
    const answer = await inquirer.prompt([
      {
        name: 'envMap',
        message: 'Input a envMap to batch deployment:',
        type: 'editor',
        postfix: '.json',
      },
    ]);
    const unescapAnswer = answer.envMap?.replace(/\\/g, '');
    const envMap = JSON.parse(unescapAnswer);
    await muse.pm.deployPlugin({ appName, envMap });
  });

// let other plugins add their own cli program commands
muse.plugin.invoke('museCli.processProgram', program, chalk);

// sort commands alphabetically
program.configureHelp({
  sortSubcommands: true,
});

program
  .parseAsync(process.argv)
  .then(() => {
    const timeEnd = Date.now();
    const timeSpan = (timeEnd - timeStart) / 1000;
    console.log(chalk.green(`✨ Done in ${timeSpan}s.`));
  })
  .catch(err => {
    const timeEnd = Date.now();
    const timeSpan = (timeEnd - timeStart) / 1000;
    // console.log(err);
    console.error(err.message);
    if (err.stack) console.error(err.stack || err.message);
    console.error(`Command failed in ${timeSpan}s.`);
  });
