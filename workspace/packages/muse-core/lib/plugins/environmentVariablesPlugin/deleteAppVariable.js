const getApp = require('../../am/getApp');
const updateApp = require('../../am/updateApp');
const { osUsername, validate } = require('../../utils');
const schema = require('../../schemas/plugins/environmentVariablesPlugin/deleteAppVariable.json');
const logger = require('../../logger').createLogger('muse.am.deleteAppVariable');

/**
 * @module muse-core/plugins/environmentVariablesPlugin/deleteAppVariable
 */

/**
 * @param {object} params Args to delete variables from apps.
 * @param {string} params.appName The app name.
 * @param {array} params.variables The variables of app to be deleted. Each array element is an object { name: 'var. name', value: 'var. value'}.
 * @param {array} params.envNames The environments of app.
 * @param {string} [params.author=osUsername] Default to the current os logged in user.
 * @returns {object} App.
 */

module.exports = async params => {
  validate(schema, params);
  if (!params.author) params.author = osUsername;
  const { appName, variables, envNames = [], author } = params;

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
