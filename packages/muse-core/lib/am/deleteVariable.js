const getApp = require('./getApp');
const updateApp = require('./updateApp');
const { osUsername } = require('../utils');
const { validate } = require('schema-utils');
const schema = require('../schemas/am/deleteVariable.json');

module.exports = async (params) => {
  validate(schema, params);
  const { appName, variables, envName } = params;

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
