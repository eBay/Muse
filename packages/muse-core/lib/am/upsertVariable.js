const getApp = require('./getApp');
const updateApp = require('./updateApp');
const { osUsername } = require('../utils');
const { validate } = require('schema-utils');
const schema = require('../schemas/am/upsertVariable.json');
const logger = require('../logger').createLogger('muse.am.upsertVariable');

/**
 * @module muse-core/am/upsertVariable
 */

/**
 * @typedef {object} UpsertVariableArgument
 * @property {string} appName the app name
 * @property {array} variables the variables of app to be upsert. Each array element is an object { name: 'var. name', value: 'var. value'}
 * @property {string} envName the environment of app
 */

/**
 *
 * @param {UpsertVariableArgument} params args to upsert variables from apps
 * @returns {object} app
 */
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

  logger.info(`Upsert Application variables success: ${appName}${envName ? `/${envName}` : ``}.`);
  return ctx.app;
};
