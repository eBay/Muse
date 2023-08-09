const { asyncInvoke, jsonByYamlBuff, validate } = require('../utils');
const { registry } = require('../storage');
const schema = require('../schemas/pm/getDeployedPlugins.json');
const logger = require('../logger').createLogger('muse.pm.getDeployedPlugins');
/**
 * @module muse-core/pm/getDeployedPlugins
 */
/**
 * @description Get information about all deployed plugins from an environment of an app
 * @param {string} appName App name.
 * @param {string} envName Environment.
 * @returns {object[]} List of plugin object.
 *
 */
module.exports = async (appName, envName) => {
  validate(schema, appName);
  validate(schema, envName);
  const ctx = {};
  logger.verbose(`Getting deployed plugins @${appName}/${envName}`);

  await asyncInvoke('museCore.pm.beforeGetDeployedPlugins', ctx, appName, envName);

  try {
    const items = await registry.listWithContent(`/apps/${appName}/${envName}`);
    ctx.plugins = items.map((item) => jsonByYamlBuff(item.content));
    await asyncInvoke('museCore.pm.getDeployedPlugins', ctx, appName, envName);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedGetDeployedPlugins', ctx, appName, envName);
  }

  await asyncInvoke('museCore.pm.afterGetDeployedPlugins', ctx, appName, envName);
  logger.verbose(`Get deployed plugins success: @${appName}/${envName}`);
  return ctx.plugins;
};
