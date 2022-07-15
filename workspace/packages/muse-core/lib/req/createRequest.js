const yaml = require('js-yaml');
const { asyncInvoke, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const schema = require('../schemas/req/createRequest.json');

/**
 * @module muse-core/req/createRequest
 */

/**
 * @description Create a request.
 * @param {object} params Args to release a plugin.
 * @param {string} params.type The request type.
 * @param {object} params.payload The request payload.
 * @param {string} params.options
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 * @returns {request}
 * @property {string} id `${type}-${Date.now()}`
 * @property {string} type
 * @property {string} createdBy
 * @property {string} createdAt
 * @property {string} payload
 * @property {...*}
 */
module.exports = async (params = {}) => {
  validate(schema, params);
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
