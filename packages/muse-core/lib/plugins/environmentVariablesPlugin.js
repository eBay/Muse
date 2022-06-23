const { upsertVariable, deleteVariable } = require('../am');
const { upsertPluginVariable, deletePluginVariable } = require('../pm');

module.exports = () => {
  return {
    name: 'environment-variables',
    museCli: {
      processProgram: (program) => {
        program
          .command('add-app-var')
          .alias('upsert-app-var')
          .description('Upsert environment variables from an application')
          .argument('<appName>', 'Application name')
          .option('-v, --vars <variables...>', 'space separated list of variable = value')
          .option('--env <envName>', 'Environment name')
          .addHelpText(
            'after',
            `
If --env is not specified, variables are set as default for any environment`,
          )
          .action(async (appName, options) => {
            const mappedVariables = options.vars.map((v) => {
              const varObj = v.split('=');
              return { name: varObj[0], value: varObj[1] };
            });
            upsertVariable({ appName, variables: mappedVariables, envName: options.env });
          });

        program
          .command('del-app-var')
          .alias('delete-app-var')
          .description('Delete environment variables from an application')
          .argument('<appName>', 'Application name')
          .option('-v, --vars <variables...>', 'space separated list of variable names')
          .option('--env <envName>', 'Environment name')
          .addHelpText(
            'after',
            `
If --env is not specified, variables are deleted from the apps's default configuration`,
          )
          .action(async (appName, options) => {
            deleteVariable({ appName, variables: options.vars, envName: options.env });
          });

        program
          .command('add-plugin-var')
          .alias('upsert-plugin-var')
          .description('Upsert environment variables from a plugin')
          .argument('<pluginName>', 'Plugin name')
          .option('-v, --vars <variables...>', 'space separated list of variable = value')
          .option('-app, --application <appName>', 'Application name')
          .option('--env <envName>', 'Environment name')
          .addHelpText(
            'after',
            `
If --app is not specified, variables are set as plugin default for any environment.
If --env is not specified, 'staging' env is assumed by default`,
          )
          .action(async (pluginName, options) => {
            const mappedVariables = options.vars.map((v) => {
              const varObj = v.split('=');
              return { name: varObj[0], value: varObj[1] };
            });
            upsertPluginVariable({
              pluginName,
              variables: mappedVariables,
              appName: options.application,
              envName: options.env,
            });
          });

        program
          .command('del-plugin-var')
          .alias('delete-plugin-var')
          .description('Delete environment variables from a plugin')
          .argument('<pluginName>', 'Plugin name')
          .option('-v, --vars <variables...>', 'space separated list of variable names')
          .option('-app, --application <appName>', 'Application name')
          .option('--env <envName>', 'Environment name')
          .addHelpText(
            'after',
            `
If --app is not specified, variables are deleted from plugin default configuration for any environment.
If --env is not specified, 'staging' env is assumed by default`,
          )
          .action(async (pluginName, options) => {
            deletePluginVariable({
              pluginName,
              variables: options.vars,
              appName: options.application,
              envName: options.env,
            });
          });
      },
    },
  };
};
