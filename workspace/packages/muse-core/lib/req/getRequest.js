const { asyncInvoke, jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');

/**
 * @module muse-core/req/getRequest
 */

/**
 * @description Get metadata of a request.
 * @param {string}  requestId The request Id.
 * @returns {Buffer} Buffer of request.
 */
module.exports = async requestId => {
  if (requestId) {
    const ctx = {};
    await asyncInvoke('museCore.req.beforeGetRequest', ctx, requestId);

    try {
      const keyPath = `/requests/${requestId}.yaml`;
      ctx.request = jsonByYamlBuff(await registry.get(keyPath));
      await asyncInvoke('museCore.req.getRequest', ctx, requestId);
    } catch (err) {
      ctx.error = err;
      await asyncInvoke('museCore.req.failedGetRequest', ctx, requestId);
      throw err;
    }
    await asyncInvoke('museCore.req.afterGetRequest', ctx, requestId);
    return ctx.request;
  } else {
    throw new Error('The param requestId is required.');
  }
};
