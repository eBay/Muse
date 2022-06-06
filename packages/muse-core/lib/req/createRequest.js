const yaml = require('js-yaml');
const { asyncInvoke, osUsername } = require('../utils');
const { registry } = require('../storage');

module.exports = async (params = {}) => {
  const ctx = {};
  await asyncInvoke('museCore.req.beforeCreateRequest', ctx, params);

  const { type, payload, author = osUsername, options, msg } = params;

  const keyPath = `/requests/${type}-${Date.now()}.yaml`;
  ctx.request = {
    type,
    createdBy: author,
    createdAt: new Date().toJSON(),
    ...options,
    payload,
  };

  try {
    await asyncInvoke('museCore.req.createRequest', ctx, params);
    await registry.set(
      keyPath,
      Buffer.from(yaml.dump(ctx.request)),
      '[request] ' + (msg || `${type} by ${author}`),
    );
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.req.failedCreateRequest', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.req.afterCreateRequest', ctx, params);
  return ctx.app;
};
