const { asyncInvoke, validate } = require('../utils');
const { registry } = require('../storage');
const schema = require('../schemas/msp/getMsp.json');
const logger = require('../logger').createLogger('muse.msp.getMsp');

/**
 * @module muse-core/msp/getMsp
 */

/**
 * @description Get all MSP presets as raw JSON from /msp.yaml.
 * @param {object} [params={}]
 * @returns {object|null} The parsed msp.yaml content, or null if it doesn't exist.
 */
module.exports = async (params = {}) => {
  validate(schema, params);
  const ctx = {};
  logger.verbose('Getting msp...');
  await asyncInvoke('museCore.msp.beforeGetMsp', ctx, params);

  try {
    ctx.msp = await registry.getJsonByYaml('/msp.yaml');
    await asyncInvoke('museCore.msp.getMsp', ctx, params);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.msp.failedGetMsp', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.msp.afterGetMsp', ctx, params);
  logger.verbose('Get msp success.');
  return ctx.msp;
};
