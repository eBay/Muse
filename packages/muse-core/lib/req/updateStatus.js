const _ = require('lodash');
const yaml = require('js-yaml');
const { asyncInvoke, updateJson, osUsername } = require('../utils');
const { registry } = require('../storage');
const getRequest = require('./getRequest');

// This also includes the creation of status
module.exports = async (params) => {
  const { requestId, status, statuses = [], author = osUsername, msg } = params;
  const ctx = {};

  /**
   * status: { reason: 'name', ...rest}
   */
  const all = _.castArray(status || statuses);
  await asyncInvoke('museCore.req.beforeUpdateStatus', ctx, params);
  ctx.request = await getRequest(requestId);
  if (!ctx.request) {
    throw new Error(`Request ${requestId} doesn't exist.`);
  }
  try {
    updateJson(ctx.request, changes);

    const keyPath = `/requests/${requestId}.yaml`;
    await asyncInvoke('museCore.req.updateStatus', ctx, params);
    await registry.set(
      keyPath,
      Buffer.from(yaml.dump(ctx.request)),
      msg || `Update request ${requestId} by ${author}`,
    );
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.req.failedUpdateStatus', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.req.afterUpdateStatus', ctx, params);
  return ctx.request;
};
