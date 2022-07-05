const { asyncInvoke, osUsername } = require('../utils');
const getRequest = require('./getRequest');
const deleteRequest = require('./deleteRequest');
const pm = require('../pm');

/**
 * @module muse-core/req/completeRequest
 */
/**
 * @typedef {object} CompleteRequestArgument
 * @property {string} requestId the request Id
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 */

/**
 * @description Merge a request
 * @param {CompleteRequestArgument} params args to merge a request
 * @returns {request} request object
 */
module.exports = async ({ requestId, msg, author = osUsername }) => {
  const ctx = {};
  await asyncInvoke('museCore.req.beforeCompleteRequest', ctx, requestId);

  const req = await getRequest(requestId);
  ctx.request = req;
  const { type, payload } = req;

  try {
    // You can extend merge request based on type by creating plugins
    await asyncInvoke('museCore.req.completeRequest', ctx);
    switch (type) {
      // This is the only built-in support type of request
      case 'deploy-plugin':
        await pm.deployPlugin({ ...payload, msg: msg || `Merge request of ${type} by ${author}.` });
        break;
      default:
        break;
    }
    await deleteRequest({ requestId });
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.req.failedCompleteRequest', ctx);
    throw err;
  }
  await asyncInvoke('museCore.req.afterCompleteRequest', ctx);
  return ctx.request;
};
