const {
  setAppVariable,
  deleteAppVariable,
  setPluginVariable,
  deletePluginVariable,
} = require('./');

module.exports = () => {
  return {
    name: 'environment-variables',
    museCore: {
      processMuse: museObj => {
        museObj.am.deleteVariable = require('./deleteAppVariable');
        museObj.pm.deleteVariable = require('./deletePluginVariable');
        museObj.am.setVariable = require('./setAppVariable');
        museObj.pm.setVariable = require('./setPluginVariable');
      },
    },
    museCli: {
      processProgram: program => {
        program
          .command('set-app-var')
          .description('Set or update environment variables for an application')
          .argument('<appName>', 'Application name')
          .option('-v, --vars <variables...>', 'space separated list of variable = value')
          .option('-e, --envs <environments...>', 'space separated list of environment names')
          .addHelpText(
            'after',
            `
If --envs is not specified, variables are set as default for any environment`,
          )
          .action(async (appName, options) => {
            const mappedVariables = options.vars.map(v => {
              const varObj = v.split('=');
              return { name: varObj[0], value: varObj[1] };
            });
            setAppVariable({ appName, variables: mappedVariables, envNames: options.envs });
          });

        program
          .command('del-app-var')
          .alias('delete-app-var')
          .description('Delete environment variables from an application')
          .argument('<appName>', 'Application name')
          .option('-v, --vars <variables...>', 'space separated list of variable names')
          .option('-e, --envs <environments...>', 'space separated list of environment names')
          .addHelpText(
            'after',
            `
If --envs is not specified, variables are deleted from the apps's default configuration`,
          )
          .action(async (appName, options) => {
            deleteAppVariable({ appName, variables: options.vars, envNames: options.envs });
          });

        program
          .command('set-plugin-var')
          .description('Set or update environment variables for a plugin')
          .argument('<pluginName>', 'Plugin name')
          .option('-v, --vars <variables...>', 'space separated list of variable = value')
          .option('-app, --application <appName>', 'Application name')
          .option('-e, --envs <environments>', 'space separated list of environment names')
          .addHelpText(
            'after',
            `
If --app is not specified, variables are set as plugin default for any environment.
If --envs is not specified, 'staging' env is assumed by default`,
          )
          .action(async (pluginName, options) => {
            const mappedVariables = options.vars.map(v => {
              const varObj = v.split('=');
              return { name: varObj[0], value: varObj[1] };
            });
            setPluginVariable({
              pluginName,
              variables: mappedVariables,
              appName: options.application,
              envNames: options.envs,
            });
          });

        program
          .command('del-plugin-var')
          .alias('delete-plugin-var')
          .description('Delete environment variables from a plugin')
          .argument('<pluginName>', 'Plugin name')
          .option('-v, --vars <variables...>', 'space separated list of variable names')
          .option('-app, --application <appName>', 'Application name')
          .option('-e, --envs <environments>', 'space separated list of environment names')
          .addHelpText(
            'after',
            `
If --app is not specified, variables are deleted from plugin default configuration for any environment.
If --envs is not specified, 'staging' env is assumed by default`,
          )
          .action(async (pluginName, options) => {
            deletePluginVariable({
              pluginName,
              variables: options.vars,
              appName: options.application,
              envNames: options.envs,
            });
          });
      },
    },
  };
};
