const _ = require('lodash');
const yaml = require('js-yaml');
const { asyncInvoke, updateJson, osUsername } = require('../utils');
const { registry } = require('../storage');
const getRequest = require('./getRequest');
const mergeRequest = require('./mergeRequest');

/** This also includes the creation of status */
/**
 * @module muse-core/req/updateStatus
 */
/**
 * @typedef {object} UpdateStatusArgument
 * @property {string} requestId the request Id
 * @property {string} status the request status
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 */

/**
 * @description Merge a request
 * @param {UpdateStatusArgument} params args to merge a request
 * @returns {request} request object
 */

module.exports = async (params) => {
  const { requestId, status, author = osUsername, msg } = params;
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
    if (ctx.request.statuses.every((s) => s.state === 'success')) {
      await mergeRequest({ requestId });
    }
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.req.failedUpdateStatus', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.req.afterUpdateStatus', ctx, params);
  return ctx.request;
};
