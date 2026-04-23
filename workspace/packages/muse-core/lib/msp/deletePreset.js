const { asyncInvoke, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getMsp = require('./getMsp');
const schema = require('../schemas/msp/deletePreset.json');
const logger = require('../logger').createLogger('muse.msp.deletePreset');

/**
 * @module muse-core/msp/deletePreset
 */

/**
 * @description Delete a preset from /msp.yaml.
 * @param {object} params
 * @param {string} params.name The preset name to delete.
 * @param {string} [params.author=osUsername]
 * @param {string} [params.msg] Commit message.
 */
module.exports = async (params = {}) => {
  validate(schema, params);
  const ctx = {};
  if (!params.author) params.author = osUsername;
  const { name, author, msg } = params;
  logger.info(`Deleting preset ${name}...`);
  await asyncInvoke('museCore.msp.beforeDeletePreset', ctx, params);

  const msp = await getMsp();
  if (!msp) throw new Error('msp.yaml does not exist.');
  if (!msp[name]) throw new Error(`Preset ${name} does not exist.`);

  ctx.preset = msp[name];

  try {
    delete msp[name];
    await asyncInvoke('museCore.msp.deletePreset', ctx, params);
    await registry.setYaml('/msp.yaml', msp, msg || `Delete preset ${name} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.msp.failedDeletePreset', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.msp.afterDeletePreset', ctx, params);
  logger.info(`Delete preset success: ${name}.`);
  return ctx;
};
