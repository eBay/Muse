const { asyncInvoke, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const schema = require('../schemas/req/deleteRequest.json');

/**
 * @module muse-core/req/deleteRequest
 */

/**
 * @description Create a request.
 * @param {object} params Args to release a plugin.
 * @param {string} params.requestId The request id.
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 * @returns {request} request object
 */
module.exports = async params => {
  validate(schema, params);
  const ctx = {};
  if (!params.author) params.author = osUsername;
  const { requestId, author, msg } = params;
  if (!requestId) throw new Error(`requestId is required.`);
  const keyPath = `/requests/${requestId}.yaml`;

  await asyncInvoke('museCore.req.beforeDeleteRequest', ctx, params);

  try {
    await asyncInvoke('museCore.req.deleteRequest', ctx, params);
    await registry.del(keyPath, msg || `Deleted request ${requestId} by ${author}.`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.req.failedDeleteRequest', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.req.afterDeleteRequest', ctx, params);
  return ctx.request;
};
