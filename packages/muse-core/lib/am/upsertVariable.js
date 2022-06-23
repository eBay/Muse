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
      set: [],
    };

    if (variables) {
      for (const vari of variables) {
        ctx.changes.set.push({
          path: !envName ? `variables.${vari.name}` : `envs.${envName}.variables.${vari.name}`,
          value: vari.value,
        });
      }

      await updateApp({
        appName,
        changes: ctx.changes,
        author: osUsername,
        msg: `Upsert environment variables ${variables} on ${appName}${
          envName ? `/${envName}` : ''
        }  by ${osUsername}.`,
      });
    }
  } catch (err) {
    ctx.error = err;
    throw err;
  }
};
