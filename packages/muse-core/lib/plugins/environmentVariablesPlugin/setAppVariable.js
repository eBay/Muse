const getApp = require('../../am/getApp');
const updateApp = require('../../am/updateApp');
const { osUsername , validate } = require('../../utils');
const schema = require('../../schemas/plugins/environmentVariablesPlugin/setAppVariable.json');
const logger = require('../../logger').createLogger('muse.am.setAppVariable');

/**
 * @module muse-core/plugins/environmentVariablesPlugin/setAppVariable
 */

/**
 * @typedef {object} SetAppVariableArgument
 * @property {string} appName the app name
 * @property {array} variables the variables of app to be upsert. Each array element is an object { name: 'var. name', value: 'var. value'}
 * @property {array} envNames the environments of app
 * @property {string} [author=osUsername] default to the current os logged in user
 */

/**
 *
 * @param {SetAppVariableArgument} params args to upsert variables from apps
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
      set: [],
    };

    if (variables) {
      if (envNames.length === 0) {
        // if no environments specified, we update app configuration directly ( defaults for any environment )
        for (const vari of variables) {
          ctx.changes.set.push({
            path: `variables.${vari.name}`,
            value: vari.value,
          });
        }
      } else {
        // set variables for each environment specified
        for (const vari of variables) {
          for (const envi of envNames) {
            ctx.changes.set.push({
              path: `envs.${envi}.variables.${vari.name}`,
              value: vari.value,
            });
          }
        }
      }

      ctx.app = await updateApp({
        appName,
        changes: ctx.changes,
        author,
        msg: `Set environment variables on ${appName}${
          envNames.length > 0 ? ` [${envNames.toString()}]` : ''
        }  by ${author}.`,
      });
    }
  } catch (err) {
    ctx.error = err;
    throw err;
  }

  logger.info(
    `Set Application variables success: ${appName}${
      envNames.length > 0 ? `[${envNames.toString()}]` : ''
    }.`,
  );
  return ctx.app;
};
