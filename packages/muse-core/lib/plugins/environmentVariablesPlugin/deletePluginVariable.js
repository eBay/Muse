const updatePlugin = require('../../pm/updatePlugin');
const getPlugin = require('../../pm/getPlugin');
const { osUsername , validate } = require('../../utils');
const schema = require('../../schemas/plugins/environmentVariablesPlugin/deletePluginVariable.json');
const logger = require('../../logger').createLogger('muse.pm.deletePluginVariable');

/**
 * @module muse-core/plugins/environmentVariablesPlugin/deletePluginVariable
 */
/**
 * @typedef {object} DeletePluginVariableArgument
 * @property {string} pluginName the plugin name
 * @property {array} variables the variables to apply. Each array element is an object { name: 'var. name', value: 'var. value'}
 * @property {string} appName the app name
 * @property {array} envNames the environment names
 * @property {string} [author=osUsername] default to the current os logged in user
 */

/**
 *
 * @param {DeletePluginVariableArgument} params args to delete a plugin variable
 * @returns {object} plugin object
 */
module.exports = async params => {
  validate(schema, params);
  const { pluginName, variables, appName, envNames = [], author = osUsername } = params;

  const ctx = {};
  try {
    ctx.plugin = await getPlugin(pluginName);
    if (!ctx.plugin) {
      throw new Error(`Plugin ${pluginName} doesn't exist.`);
    }

    ctx.changes = {
      unset: [],
    };

    if (variables) {
      for (const vari of variables) {
        ctx.changes.unset.push(`variables.${vari}`);
      }

      ctx.plugin = await updatePlugin({
        pluginName,
        appName,
        envNames,
        changes: ctx.changes,
        author,
        msg: `Delete environment variables for ${pluginName} ${
          appName ? ` on ${appName}${envNames ? ` [${envNames.toString()}]` : ''}` : ''
        }  by ${author}.`,
      });
    }
  } catch (err) {
    ctx.error = err;
    throw err;
  }

  logger.info(`Delete plugin variables success: ${pluginName}.`);
  return ctx.plugin;
};
