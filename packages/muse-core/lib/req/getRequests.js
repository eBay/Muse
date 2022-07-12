const { asyncInvoke, jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');

/**
 * @module muse-core/req/getRequests
 */

/**
 * @description Get metadata of all apps
 * @param {*} [params] args to get all apps
 * @returns {object[]} list of request object
 */

module.exports = async params => {
  const ctx = {};
  await asyncInvoke('museCore.req.beforeGetRequests', ctx, params);
  try {
    const items = await registry.listWithContent('/requests');

    ctx.requests = items
      .filter(item => item.type !== 'dir' && item.name.endsWith('.yaml'))
      .map(item => jsonByYamlBuff(item.content));
    await asyncInvoke('museCore.req.getRequests', ctx, params);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.req.failedGetRequests', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.req.afterGetRequests', ctx, params);
  return ctx.requests;
};
