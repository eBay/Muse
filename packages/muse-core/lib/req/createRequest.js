const yaml = require('js-yaml');
const { asyncInvoke, osUsername } = require('../utils');
const { registry } = require('../storage');
/**
 * @module muse-core/req/createRequest
 */
/**
 * @typedef {object} CreateRequestArgument
 * @property {string} type the request type
 * @property {object} payload the request payload
 * @property {string} options
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 */

/**
 * @description Create a request
 * @param {CreateRequestArgument} params args to release a plugin
 * @returns {request}
 * @property {string} id `${type}-${Date.now()}`
 * @property {string} type
 * @property {string} createdBy
 * @property {string} createdAt
 * @property {string} payload
 * @property {...*}
 */
module.exports = async (params = {}) => {
  const ctx = {};
  await asyncInvoke('museCore.req.beforeCreateRequest', ctx, params);

  const { id, type, payload, author = osUsername, autoComplete = true, options, msg } = params;
  if (!id) throw new Error(`id is required to create request.`);
  const keyPath = `/requests/${id}.yaml`;
  ctx.request = {
    id,
    type,
    createdBy: author,
    createdAt: new Date().toJSON(),
    description: msg || '',
    autoComplete,
    ...options,
    payload,
  };

  try {
    await asyncInvoke('museCore.req.createRequest', ctx, params);
    await registry.set(
      keyPath,
      Buffer.from(yaml.dump(ctx.request)),
      `[Request] ${msg || type} by ${author}.`,
    );
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.req.failedCreateRequest', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.req.afterCreateRequest', ctx, params);
  return ctx.request;
};
