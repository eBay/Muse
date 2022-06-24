const updatePlugin = require('../../pm/updatePlugin');
const getPlugin = require('../../pm/getPlugin');
const { osUsername } = require('../../utils');
const { validate } = require('schema-utils');
const schema = require('../../schemas/plugins/environmentVariablesPlugin/setPluginVariable.json');
const logger = require('../../logger').createLogger('muse.pm.upsertPluginVariable');

/**
 * @module muse-core/plugins/environmentVariablesPlugin/updatePlugin
 */
/**
 * @typedef {object} UpsertPluginVariableArgument
 * @property {string} pluginName the plugin name
 * @property {array} variables the variables to apply. Each array element is an object { name: 'var. name', value: 'var. value'}
 * @property {string} appName the app name
 * @property {string} envName the environment name
 * @property {string} [author=osUsername] default to the current os logged in user
 */

/**
 *
 * @param {UpsertPluginVariableArgument} params args to update a plugin variable
 * @returns {object} plugin object
 */
module.exports = async (params) => {
  validate(schema, params);
  const { pluginName, variables, appName, envName = 'staging', author = osUsername } = params;

  const ctx = {};
  try {
    ctx.plugin = await getPlugin(pluginName);
    if (!ctx.plugin) {
      throw new Error(`Plugin ${pluginName} doesn't exist.`);
    }

    ctx.changes = {
      set: [],
    };

    if (variables) {
      for (const vari of variables) {
        ctx.changes.set.push({
          path: `variables.${vari.name}`,
          value: vari.value,
        });
      }

      ctx.plugin = await updatePlugin({
        pluginName,
        appName,
        envName,
        changes: ctx.changes,
        author,
        msg: `Upsert environment variables for ${pluginName} ${
          appName ? ` on ${appName}${envName ? `/${envName}` : ''}` : ''
        }  by ${author}.`,
      });
    }
  } catch (err) {
    ctx.error = err;
    throw err;
  }

  logger.info(`Upsert plugin variables success: ${pluginName}.`);
  return ctx.plugin;
};
