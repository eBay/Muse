const updatePlugin = require('../../pm/updatePlugin');
const getPlugin = require('../../pm/getPlugin');
const { osUsername, validate } = require('../../utils');
const schema = require('../../schemas/plugins/environmentVariablesPlugin/setPluginVariable.json');
const logger = require('../../logger').createLogger('muse.pm.setPluginVariable');

/**
 * @module muse-core/plugins/environmentVariablesPlugin/setPluginVariable
 */
/**
 * @param {object} params Args to update a plugin variable.
 * @param {string} params.pluginName The plugin name.
 * @param {array} params.variables The variables to apply. Each array element is an object { name: 'var. name', value: 'var. value'}.
 * @param {string} params.appName The app name.
 * @param {array} params.envNames The environments of app.
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
        envNames,
        changes: ctx.changes,
        author,
        msg: `Set environment variables for ${pluginName} ${
          appName ? ` on ${appName}${envNames ? ` [${envNames.toString()}]` : ''}` : ''
        }  by ${author}.`,
      });
    }
  } catch (err) {
    ctx.error = err;
    throw err;
  }

  logger.info(`Set plugin variables success: ${pluginName}.`);
  return ctx.plugin;
};
