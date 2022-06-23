const { asyncInvoke, getPluginId, updateJson, osUsername } = require('../utils');
const { registry } = require('../storage');
const logger = require('../logger').createLogger('muse.pm.updatePlugin');

/**
 * @module muse-core/pm/updatePlugin
 */
module.exports = async (params) => {
  //validate(schema, params);
  const { pluginName, appName, envName = 'staging', changes, author = osUsername, msg } = params;
  logger.info(`Updating plugin ${pluginName}...`);
  const ctx = {};

  await asyncInvoke('museCore.pm.beforeUpdatePlugin', ctx, params);

  try {
    const pid = getPluginId(pluginName);
    if (!pid) {
      throw new Error(`Plugin ${pluginName} doesn't exist.`);
    }

    const keyPath =
      appName && envName ? `/apps/${appName}/${envName}/${pid}.yaml` : `/plugins/${pid}.yaml`;

    ctx.plugin = await registry.getJsonByYaml(keyPath);
    updateJson(ctx.plugin, changes || {});

    await asyncInvoke('museCore.pm.updatePlugin', ctx, params);
    await registry.setYaml(keyPath, ctx.plugin, msg || `Update plugin ${pluginName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedUpdatePlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterUpdatePlugin', ctx, params);
  logger.info(`Update plugin success: ${pluginName}.`);
  return ctx.app;
};
