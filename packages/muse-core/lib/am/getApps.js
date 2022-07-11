const { asyncInvoke, jsonByYamlBuff, batchAsync, makeRetryAble } = require('../utils');
const { registry } = require('../storage');
const logger = require('../logger').createLogger('muse.am.getApps');

/**
 * @module muse-core/am/getApps
 */

/**
 * @description Get metadata of all apps.
 * @param {*} [params] Args to get all apps.
 * @returns {object[]} List of app object.
 */
module.exports = async params => {
  const ctx = {};
  logger.info(`Getting apps...`);
  await asyncInvoke('museCore.am.beforeGetApps', ctx, params);
  try {
    const items = await registry.list('/apps');
    await batchAsync(
      items
        .filter(item => item.type === 'dir')
        .map(item => async () => {
          console.log(item);
          item.content = await makeRetryAble(async (...args) => registry.get(...args))(
            `/apps/${item.name}/${item.name}.yaml`,
          );
        }),
      100, // TODO: make it configurable
    );

    ctx.apps = items.map(item => jsonByYamlBuff(item.content));
    await asyncInvoke('museCore.am.getApps', ctx, params);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedGetApps', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterGetApps', ctx, params);
  logger.info(`Get apps success.`);
  return ctx.apps;
};
