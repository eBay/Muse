const { asyncInvoke, jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');
const logger = require('../logger').createLogger('muse.pm.getPlugins');
/**
 * @module muse-core/pm/getPlugin
 */
/**
 * @description Get metadata of all plugins from the registry storage.
 * @param {*} params
 * @returns {Buffer[]}
 */
module.exports = async params => {
  const ctx = {};
  logger.verbose(`Getting plugins...`);
  await asyncInvoke('museCore.pm.beforeGetPlugins', ctx, params);

  try {
    const items = await registry.listWithContent('/plugins');

    ctx.plugins = items
      .filter(item => item.type !== 'dir' && item.name.endsWith('.yaml'))
      .map(item => jsonByYamlBuff(item.content));
    await asyncInvoke('museCore.pm.getPlugins', ctx, params);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedGetPlugins', ctx, params);
    throw err;
  }

  await asyncInvoke('museCore.pm.afterGetPlugins', ctx, params);
  logger.verbose(`Get plugins success.`);
  return ctx.plugins;
};
