const getApp = require('./getApp');
const updateApp = require('./updateApp');
const { osUsername } = require('../utils');

module.exports = async (appName, variables, envName) => {
  const ctx = {};
  try {
    ctx.app = await getApp(appName);
    if (!ctx.app) {
      throw new Error(`App ${appName} doesn't exist.`);
    }

    ctx.changes = {
      unset: [],
    };

    if (variables) {
      for (const vari of variables) {
        ctx.changes.unset.push(
          !envName ? `variables.${vari}` : `envs.${envName}.variables.${vari}`,
        );
      }

      await updateApp({
        appName,
        changes: ctx.changes,
        author: osUsername,
        msg: `Delete environment variables ${variables} on ${appName}${
          envName ? `/${envName}` : ''
        }  by ${osUsername}.`,
      });
    }
  } catch (err) {
    ctx.error = err;
    throw err;
  }
};
