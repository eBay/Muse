const { getApp, updateApp } = require('../am');
const { osUsername } = require('../utils');

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
            const ctx = {};
            try {
              ctx.app = await getApp(appName);
              if (!ctx.app) {
                throw new Error(`App ${appName} doesn't exist.`);
              }

              ctx.changes = {
                set: [],
              };

              if (options.vars) {
                for (const vari of options.vars) {
                  const variableArray = vari.split('=');
                  ctx.changes.set.push({
                    path: !options.env
                      ? `variables.${variableArray[0]}`
                      : `envs.${options.env}.variables.${variableArray[0]}`,
                    value: variableArray[1],
                  });
                }

                await updateApp({
                  appName,
                  changes: ctx.changes,
                  author: osUsername,
                  msg: `Upsert environment variables ${options.vars} on ${appName}${
                    options.env ? `/${options.env}` : ''
                  }  by ${osUsername}.`,
                });
              }
            } catch (err) {
              ctx.error = err;
              throw err;
            }
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
            const ctx = {};
            try {
              ctx.app = await getApp(appName);
              if (!ctx.app) {
                throw new Error(`App ${appName} doesn't exist.`);
              }

              ctx.changes = {
                unset: [],
              };

              if (options.vars) {
                for (const vari of options.vars) {
                  ctx.changes.unset.push(
                    !options.env ? `variables.${vari}` : `envs.${options.env}.variables.${vari}`,
                  );
                }

                await updateApp({
                  appName,
                  changes: ctx.changes,
                  author: osUsername,
                  msg: `Delete environment variables ${options.vars} on ${appName}${
                    options.env ? `/${options.env}` : ''
                  } by ${osUsername}.`,
                });
              }
            } catch (err) {
              ctx.error = err;
              throw err;
            }
          });
      },
    },
  };
};
