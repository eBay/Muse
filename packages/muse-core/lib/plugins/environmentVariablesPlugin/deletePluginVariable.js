const updatePlugin = require('../../pm/updatePlugin');
const { getPluginId, osUsername } = require('../../utils');
const { validate } = require('schema-utils');
const schema = require('../../schemas/pm/deletePluginVariable.json');
const logger = require('../../logger').createLogger('muse.pm.upsertPluginVariable');

/**
 * @module muse-core/pm/deletePluginVariable
 */
/**
 * @typedef {object} DeletePluginVariableArgument
 * @property {string} pluginName the plugin name
 * @property {array} variables the variables to apply. Each array element is an object { name: 'var. name', value: 'var. value'}
 * @property {string} appName the app name
 * @property {string} envName the environment name
 */

/**
 *
 * @param {DeletePluginVariableArgument} params args to delete a plugin variable
 * @returns {object} plugin object
 */
module.exports = async (params) => {
  validate(schema, params);
  const { pluginName, variables, appName, envName = 'staging' } = params;

  const ctx = {};
  try {
    const pid = getPluginId(pluginName);
    if (!pid) {
      throw new Error(`Plugin ${pluginName} doesn't exist.`);
    }

    ctx.changes = {
      unset: [],
    };

    if (variables) {
      for (const vari of variables) {
        ctx.changes.unset.push(`variables.${vari}`);
      }

      await updatePlugin({
        pluginName,
        appName,
        envName,
        changes: ctx.changes,
        author: osUsername,
        msg: `Delete environment variables ${variables} for ${pluginName} ${
          appName ? ` on ${appName}${envName ? `/${envName}` : ''}` : ''
        }  by ${osUsername}.`,
      });
    }
  } catch (err) {
    ctx.error = err;
    throw err;
  }

  logger.info(`Delete plugin variables success: ${pluginName}.`);
  return ctx;
};
