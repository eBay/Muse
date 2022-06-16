const { asyncInvoke, osUsername } = require('../utils');
const { registry } = require('../storage');

/**
 * @module muse-core/req/deleteRequest
 */
/**
 * @typedef {object} DeleteRequestArgument
 * @property {string} requestId the request id
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 */

/**
 * @description Create a request
 * @param {DeleteRequestArgument} params args to release a plugin
 * @returns {request} request object
 */
module.exports = async (params) => {
  const ctx = {};
  const { requestId, author = osUsername, msg } = params;
  if (!requestId) throw new Error(`requestId is required.`);
  const keyPath = `/requests/${requestId}.yaml`;

  await asyncInvoke('museCore.req.beforeDeleteRequest', ctx, params);

  try {
    await asyncInvoke('museCore.req.deleteRequest', ctx, params);
    await registry.del(keyPath, msg || `Delete request ${requestId} by ${author}.`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.req.failedDeleteRequest', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.req.afterDeleteRequest', ctx, params);
  return ctx.request;
};
