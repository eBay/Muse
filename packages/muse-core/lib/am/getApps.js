const { asyncInvoke, jsonByYamlBuff, batchAsync, makeRetryAble } = require('../utils');
const { registry } = require('../storage');

/**
 * @module muse-core/am/getApps
 */

/**
 * @description get metadata of all apps
 * @param {*} [params] args to get all apps
 * @returns {object[]} list of app object
 */
module.exports = async (params) => {
  const ctx = {};
  await asyncInvoke('museCore.am.beforeGetApps', ctx, params);
  try {
    const items = await registry.list('/apps');
    await batchAsync(
      items
        .filter((item) => item.type === 'dir')
        .map((item) => async () => {
          item.content = await makeRetryAble(async (...args) => registry.get(...args))(
            `/apps/${item.name}/${item.name}.yaml`,
          );
        }),
      100, // TODO: make it configurable
    );

    ctx.apps = items.map((item) => jsonByYamlBuff(item.content));
    await asyncInvoke('museCore.am.getApps', ctx, params);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedGetApps', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterGetApps', ctx, params);
  return ctx.apps;
};
