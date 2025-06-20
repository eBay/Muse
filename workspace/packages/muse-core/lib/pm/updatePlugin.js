const { asyncInvoke, getPluginId, updateJson, osUsername, validate } = require('../utils');
const getPlugin = require('./getPlugin');
const { registry } = require('../storage');
const schema = require('../schemas/pm/updatePlugin.json');
const logger = require('../logger').createLogger('muse.pm.updatePlugin');

/**
 * @module muse-core/pm/updatePlugin
 */

/**
 *
 * @param {object} params Args to update a plugin.
 * @param {string} params.pluginName The plugin name.
 * @param {string} [params.appName] The app name.
 * @param {string} [params.envName] The environment name.
 * @param {object} [params.changes] The changes to apply.
 * @param {null | object | object[]} [params.changes.set]
 * @param {null | object | object[]} [params.changes.unset]
 * @param {null | object | object[]} [params.changes.remove]
 * @param {null | object | object[]} [params.changes.push]
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 * @returns {object} Plugin object.
 */
module.exports = async (params) => {
  const updateRegistryKey = async ({ ctx, keyPath, params }) => {
    ctx.plugin = await registry.getJsonByYaml(keyPath);
    updateJson(ctx.plugin, params.changes || {});

    await registry.setYaml(
      keyPath,
      ctx.plugin,
      params.msg ||
        `Update plugin ${params.pluginName} by ${params.author ? params.author : osUsername}`,
    );
  };

  validate(schema, params);
  const { pluginName, appName, envNames = [] } = params;
  logger.info(`Updating plugin ${pluginName}...`);
  const ctx = {};

  await asyncInvoke('museCore.pm.beforeUpdatePlugin', ctx, params);

  try {
    const plugin = await getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} doesn't exist.`);
    }
    ctx.plugin = plugin;
    const pid = getPluginId(pluginName);
    await asyncInvoke('museCore.pm.updatePlugin', ctx, params);

    if (!appName) {
      const keyPath = `/plugins/${pid}.yaml`;
      await updateRegistryKey({ ctx, keyPath, params });
    } else {
      for (const envi of envNames) {
        const keyPath = `/apps/${appName}/${envi}/${pid}.yaml`;
        await updateRegistryKey({ ctx, keyPath, params });
      }
    }
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedUpdatePlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterUpdatePlugin', ctx, params);
  logger.info(`Update plugin success: ${pluginName}.`);
  return ctx.plugin;
};
