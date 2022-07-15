const { asyncInvoke, getPluginId , validate } = require('../utils');
const { registry } = require('../storage');
const schema = require('../schemas/pm/getPlugin.json');
const logger = require('../logger').createLogger('muse.pm.getPlugin');
/**
 * @module muse-core/pm/getPlugin
 */
/**
 * @description Get metadata of one plugin from the registry storage.
 * @param {*} pluginName
 * @returns {Buffer}
 */
module.exports = async (pluginName) => {
  validate(schema, pluginName);
  const ctx = {};
  logger.verbose(`Getting plugin: ${pluginName}...`);
  await asyncInvoke('museCore.pm.beforeGetPlugin', ctx, pluginName);

  await asyncInvoke('museCore.pm.getPlugin', ctx, pluginName);
  const pid = getPluginId(pluginName);
  const keyPath = `/plugins/${pid}.yaml`;

  try {
    ctx.plugin = await registry.getJsonByYaml(keyPath);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedGetPlugin', ctx, pluginName);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterGetPlugin', ctx, pluginName);
  logger.verbose(`Get plugin success: ${pluginName}...`);
  return ctx.plugin;
};
