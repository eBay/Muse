const getApp = require('../../am/getApp');
const updateApp = require('../../am/updateApp');
const { osUsername } = require('../../utils');
const { validate } = require('schema-utils');
const schema = require('../../schemas/plugins/environmentVariablesPlugin/deleteAppVariable.json');
const logger = require('../../logger').createLogger('muse.am.deleteAppVariable');

/**
 * @module muse-core/plugins/environmentVariablesPlugin/deleteAppVariable
 */

/**
 * @typedef {object} DeleteAppVariableArgument
 * @property {string} appName the app name
 * @property {array} variables the variables of app to be deleted. Each array element is an object { name: 'var. name', value: 'var. value'}
 * @property {array} envNames the environments of app
 * @property {string} [author=osUsername] default to the current os logged in user
 */

/**
 *
 * @param {DeleteAppVariableArgument} params args to delete variables from apps
 * @returns {object} app
 */
module.exports = async params => {
  validate(schema, params);
  const { appName, variables, envNames = [], author = osUsername } = params;

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
      if (envNames.length === 0) {
        // if no environments specified, we update app configuration directly ( defaults for any environment )
        for (const vari of variables) {
          ctx.changes.unset.push(`variables.${vari}`);
        }
      } else {
        // set variables for each environment specified
        for (const vari of variables) {
          for (const envi of envNames) {
            ctx.changes.unset.push(`envs.${envi}.variables.${vari}`);
          }
        }
      }

      ctx.app = await updateApp({
        appName,
        changes: ctx.changes,
        author,
        msg: `Delete environment variables on ${appName} by ${author}.`,
      });
    }
  } catch (err) {
    ctx.error = err;
    throw err;
  }

  logger.info(
    `Delete Application variables success: ${appName}${
      envNames.length > 0 ? ` [${envNames.toString()}]` : ''
    }.`,
  );
  return ctx.app;
};
