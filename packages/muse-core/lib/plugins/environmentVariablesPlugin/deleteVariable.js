const getApp = require('../../am/getApp');
const updateApp = require('../../am/updateApp');
const { osUsername } = require('../../utils');
const { validate } = require('schema-utils');
const schema = require('../../schemas/am/deleteVariable.json');
const logger = require('../../logger').createLogger('muse.am.deleteVariable');

/**
 * @module muse-core/plugins/environmentVariablesPlugin/deleteVariable
 */

/**
 * @typedef {object} DeleteVariableArgument
 * @property {string} appName the app name
 * @property {array} variables the variables of app to be deleted. Each array element is an object { name: 'var. name', value: 'var. value'}
 * @property {string} envName the environment of app
 */

/**
 *
 * @param {DeleteVariableArgument} params args to delete variables from apps
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

  logger.info(`Delete Application variables success: ${appName}${envName ? `/${envName}` : ``}.`);
  return ctx.app;
};
