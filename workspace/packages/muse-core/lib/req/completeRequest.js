const { asyncInvoke, osUsername, validate } = require('../utils');
const getRequest = require('./getRequest');
const deleteRequest = require('./deleteRequest');
const schema = require('../schemas/req/completeRequest.json');

/**
 * @module muse-core/req/completeRequest
 */
/**
 * @description Merge a request.
 * @param {object} params Args to merge a request.
 * @param {string} params.requestId The request Id.
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 * @returns {request} Request object.
 */
module.exports = async (params) => {
  validate(schema, params);
  if (!params.author) params.author = osUsername;
  const { requestId, author, msg } = params;
  const ctx = {};
  await asyncInvoke('museCore.req.beforeCompleteRequest', ctx, params);

  const req = await getRequest(requestId);
  ctx.request = req;

  try {
    // You can extend merge request based on type by creating plugins
    await asyncInvoke('museCore.req.completeRequest', ctx, params);
    await deleteRequest({ requestId, msg: msg || `Completed request ${requestId} by ${author}.` });
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.req.failedCompleteRequest', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.req.afterCompleteRequest', ctx, params);
  return ctx.request;
};
