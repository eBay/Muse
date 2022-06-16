const _ = require('lodash');
const yaml = require('js-yaml');
const { asyncInvoke, updateJson, osUsername } = require('../utils');
const { registry } = require('../storage');
const getRequest = require('./getRequest');

/**
 * @module muse-core/req/updateRequest
 */
/**
 * @typedef {object} UpdateRequestArgument
 * @property {string} requestId the request Id
 * @property {object} changes the request Id
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 */

/**
 * @description Merge a request
 * @param {UpdateRequestArgument} params args to merge a request
 * @returns {request} request object
 */
module.exports = async (params) => {
  const { requestId, changes, author = osUsername, msg } = params;
  const ctx = {};

  await asyncInvoke('museCore.req.beforeUpdateRequest', ctx, params);

  try {
    ctx.request = await getRequest(requestId);
    if (!ctx.request) {
      throw new Error(`Request ${requestId} doesn't exist.`);
    }

    updateJson(ctx.request, changes);

    const keyPath = `/requests/${requestId}.yaml`;
    await asyncInvoke('museCore.req.updateRequest', ctx, params);
    await registry.set(
      keyPath,
      Buffer.from(yaml.dump(ctx.request)),
      msg || `Update request ${requestId} by ${author}`,
    );
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.req.failedUpdateRequest', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.req.afterUpdateRequest', ctx, params);
  return ctx.request;
};
