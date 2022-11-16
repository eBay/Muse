const getApp = require('../../am/getApp');
const updateApp = require('../../am/updateApp');
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
module.exports = async (params) => {
  validate(schema, params);
  if (!params.author) params.author = osUsername;
  const { pluginName, variables, appName, envNames = [], author } = params;

  const ctx = {};
  try {
    ctx.app = await getApp(appName);
    if (!ctx.app) {
      throw new Error(`App ${appName} doesn't exist.`);
    }
    ctx.plugin = await getPlugin(pluginName);
    if (!ctx.plugin) {
      throw new Error(`Plugin ${pluginName} doesn't exist.`);
    }

    ctx.changes = {
      set: [],
    };

    if (variables) {
      if (envNames.length === 0) {
        // if no environments specified, we update app configuration directly for the plugin
        for (const vari of variables) {
          ctx.changes.set.push({
            path: `pluginVariables.${pluginName}.${vari.name}`,
            value: vari.value,
          });
        }
      } else {
        // set variables for each environment specified
        for (const vari of variables) {
          for (const envi of envNames) {
            ctx.changes.set.push({
              path: `envs.${envi}.pluginVariables.${pluginName}.${vari.name}`,
              value: vari.value,
            });
          }
        }
      }

      ctx.app = await updateApp({
        appName,
        changes: ctx.changes,
        author,
        msg: `Set environment variables on ${appName} for plugin ${pluginName} ${
          envNames.length > 0 ? ` on [${envNames.toString()}]` : ''
        }  by ${author}.`,
      });
    }
  } catch (err) {
    ctx.error = err;
    throw err;
  }

  logger.info(`Set plugin variables success: ${pluginName}.`);
  return ctx;
};
