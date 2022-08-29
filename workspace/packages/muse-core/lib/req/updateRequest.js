const _ = require('lodash');
const yaml = require('js-yaml');
const { asyncInvoke, updateJson, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getRequest = require('./getRequest');
const schema = require('../schemas/req/updateRequest.json');

/**
 * @module muse-core/req/updateRequest
 */

/**
 * @description Merge a request.
 * @param {object} params Args to merge a request.
 * @param {string} params.requestId The request Id.
 * @param {object} params.changes The request Id.
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 * @returns {request} request object
 */
module.exports = async params => {
  validate(schema, params);
  if (!params.author) params.author = osUsername;
  const { requestId, changes, author, msg } = params;
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
