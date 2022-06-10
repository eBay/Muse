const _ = require('lodash');
const yaml = require('js-yaml');
const { asyncInvoke, osUsername } = require('../utils');
const { registry } = require('../storage');
const getRequest = require('./getRequest');

// This also includes the creation of status
module.exports = async (params) => {
  const { requestId, status, author = osUsername, msg } = params;
  const ctx = {};

  const toDelete = _.castArray(status);
  await asyncInvoke('museCore.req.beforeDeleteStatus', ctx, params);
  try {
    ctx.request = await getRequest(requestId);
    if (!ctx.request) {
      throw new Error(`Request ${requestId} doesn't exist.`);
    }

    if (ctx.request.statuses) {
      ctx.request.statuses = ctx.request.statuses.filter((s) => !toDelete.includes(s.name));
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
