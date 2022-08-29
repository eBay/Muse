const _ = require('lodash');
const yaml = require('js-yaml');
const { asyncInvoke, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getRequest = require('./getRequest');
const schema = require('../schemas/req/deleteStatus.json');

/** This also includes the creation of status */
/**
 * @module muse-core/req/deleteStatus
 */

/**
 * @description Create a request.
 * @param {object} params Args to release a plugin.
 * @param {string} params.requestId The request id.
 * @param {string} params.status The request status.
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 * @returns {request} Request object.
 */
module.exports = async params => {
  validate(schema, params);

  if (!params.author) params.author = osUsername;
  const { requestId, status, author, msg } = params;
  const ctx = {};

  const toDelete = _.castArray(status);
  await asyncInvoke('museCore.req.beforeDeleteStatus', ctx, params);
  try {
    ctx.request = await getRequest(requestId);
    if (!ctx.request) {
      throw new Error(`Request ${requestId} doesn't exist.`);
    }

    if (ctx.request.statuses) {
      ctx.request.statuses = ctx.request.statuses.filter(s => !toDelete.includes(s.name));
    }

    const keyPath = `/requests/${requestId}.yaml`;
    await asyncInvoke('museCore.req.deleteStatus', ctx, params);
    await registry.set(
      keyPath,
      Buffer.from(yaml.dump(ctx.request)),
      msg || `Delete request ${requestId} status ${toDelete} by ${author}`,
    );
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.req.failedDeleteStatus', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.req.afterDeleteStatus', ctx, params);
  return ctx.request;
};
