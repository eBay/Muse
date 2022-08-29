const _ = require('lodash');
const yaml = require('js-yaml');
const { asyncInvoke, updateJson, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getRequest = require('./getRequest');
const completeRequest = require('./completeRequest');
const schema = require('../schemas/req/updateStatus.json');
/** This also includes the creation of status */
/**
 * @module muse-core/req/updateStatus
 */

/**
 * @description Update a request status.
 * @param {object} params Args to merge a request.
 * @param {string} params.requestId The request Id.
 * @param {string} params.status the request status.
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 * @returns {request} Request object.
 */
module.exports = async params => {
  validate(schema, params);
  if (!params.author) params.author = osUsername;
  const { requestId, status, author, msg } = params;
  const ctx = {};

  /**
   * status: { reason: 'name', ...rest}
   */
  const allStatus = _.castArray(status);
  await asyncInvoke('museCore.req.beforeUpdateStatus', ctx, params);
  try {
    ctx.request = await getRequest(requestId);
    if (!ctx.request) {
      throw new Error(`Request ${requestId} doesn't exist.`);
    }
    for (const s of allStatus) {
      if (!ctx.request.statuses) {
        ctx.request.statuses = [];
      }
      const found = _.find(ctx.request.statuses, { name: s.name });
      if (found) {
        Object.assign(found, s, {
          updatedAt: new Date().toJSON(),
        }); // simple merge the new status to the existing one.
      } else {
        ctx.request.statuses.push({ ...s, createdBy: author, createdAt: new Date().toJSON() }); // create the new status
      }
    }

    const keyPath = `/requests/${requestId}.yaml`;
    await asyncInvoke('museCore.req.updateStatus', ctx, params);
    await registry.set(
      keyPath,
      Buffer.from(yaml.dump(ctx.request)),
      msg || `Update request ${requestId} status by ${author}`,
    );

    // When ever a status is updated, we need to check if all status is succes
    // If so, merge the request.
    if (ctx.request.autoComplete && ctx.request.statuses.every(s => s.state === 'success')) {
      await completeRequest({ requestId });
    }
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.req.failedUpdateStatus', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.req.afterUpdateStatus', ctx, params);
  return ctx.request;
};
