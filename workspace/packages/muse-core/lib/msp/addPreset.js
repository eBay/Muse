const { asyncInvoke, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getMsp = require('./getMsp');
const schema = require('../schemas/msp/addPreset.json');
const logger = require('../logger').createLogger('muse.msp.addPreset');

/**
 * @module muse-core/msp/addPreset
 */

/**
 * @description Add a new preset to /msp.yaml.
 * @param {object} params
 * @param {string} params.name The preset name.
 * @param {object} params.preset The preset object.
 * @param {string} [params.preset.extends] Parent preset name.
 * @param {object} [params.preset.versions] Package versions for this preset.
 * @param {string} [params.author=osUsername]
 * @param {string} [params.msg] Commit message.
 * @returns {object} The created preset.
 */
module.exports = async (params = {}) => {
  validate(schema, params);
  const ctx = {};
  if (!params.author) params.author = osUsername;
  const { name, preset, author, msg } = params;
  logger.info(`Adding preset ${name}...`);
  await asyncInvoke('museCore.msp.beforeAddPreset', ctx, params);

  let msp = await getMsp();
  if (!msp) msp = {};
  if (msp[name]) throw new Error(`Preset ${name} already exists.`);

  ctx.preset = {
    creation: new Date().toJSON(),
    ...preset,
  };

  try {
    msp[name] = ctx.preset;
    await asyncInvoke('museCore.msp.addPreset', ctx, params);
    await registry.setYaml('/msp.yaml', msp, msg || `Add preset ${name} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.msp.failedAddPreset', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.msp.afterAddPreset', ctx, params);
  logger.info(`Add preset success: ${name}.`);
  return ctx.preset;
};
