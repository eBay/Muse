const updatePlugin = require('../../pm/updatePlugin');
const getPlugin = require('../../pm/getPlugin');
const { osUsername, validate } = require('../../utils');
const schema = require('../../schemas/plugins/environmentVariablesPlugin/deletePluginVariable.json');
const logger = require('../../logger').createLogger('muse.pm.deletePluginVariable');

/**
 * @module muse-core/plugins/environmentVariablesPlugin/deletePluginVariable
 */
/**
 * @param {object} params Args to delete a plugin variable.
 * @param {string} params.pluginName The plugin name.
 * @param {array} params.variables The variables to apply. Each array element is an object { name: 'var. name', value: 'var. value'}.
 * @param {string} params.appName The app name.
 * @param {array} params.envNames The environment names.
 * @param {string} [params.author=osUsername] Default to the current os logged in user.
 * @returns {object} Plugin object.
 */
module.exports = async params => {
  validate(schema, params);
  if (!params.author) params.author = osUsername;
  const { pluginName, variables, appName, envNames = [], author } = params;

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
