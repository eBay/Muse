const { upsertVariable, deleteVariable } = require('../am');

module.exports = () => {
  return {
    name: 'environment-variables',
    museCli: {
      processProgram: (program) => {
        program
          .command('add-app-var')
          .alias('upsert-app-var')
          .description('Upsert an environment variable from an application')
          .argument('<appName>', 'Application name')
          .option('-v, --vars <variables...>', 'space separated list of variable = value')
          .option('--env <envName>', 'Environment name')
          .addHelpText(
            'after',
            `
If --env is not specified, the variable is set as default for any environment`,
          )
          .action(async (appName, options) => {
            const mappedVariables = options.vars.map((v) => {
              const varObj = v.split('=');
              return { name: varObj[0], value: varObj[1] };
            });
            upsertVariable(appName, mappedVariables, options.env);
          });

        program
          .command('del-app-var')
          .alias('delete-app-var')
          .description('Delete an environment variable from an application')
          .argument('<appName>', 'Application name')
          .option('-v, --vars <variables...>', 'space separated list of variables')
          .option('--env <envName>', 'Environment name')
          .addHelpText(
            'after',
            `
If --env is not specified, the variable is deleted from the apps's default configuration`,
          )
          .action(async (appName, options) => {
            deleteVariable(appName, options.vars, options.env);
          });
      },
    },
  };
};
