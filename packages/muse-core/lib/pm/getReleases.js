const { asyncInvoke, jsonByYamlBuff, getPluginId } = require('../utils');
const { registry } = require('../storage');
const { validate } = require('schema-utils');
const schema = require('../schemas/pm/getReleases.json');
const logger = require('../logger').createLogger('muse.pm.getReleases');
/**
 * @module muse-core/pm/getReleases
 */
/**
 * @description Get all released information of a plugin
 * @param {*} pluginName
 * @returns {Buffer}
 */
module.exports = async (pluginName) => {
  validate(schema, pluginName);
  const ctx = {};
  logger.verbose(`Getting releases of ${pluginName}.`);
  await asyncInvoke('museCore.pm.beforeGetReleases', ctx, pluginName);

  const pid = getPluginId(pluginName);
  const keyPath = `/plugins/releases/${pid}.yaml`;

  try {
    ctx.result = jsonByYamlBuff(await registry.get(keyPath)) || [];
    await asyncInvoke('museCore.pm.getReleases', ctx, pluginName);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedGetReleases', ctx, pluginName);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterGetReleases', ctx, pluginName);
  logger.verbose(`Succeeded to get releases of ${pluginName}.`);
  return ctx.result;
};
