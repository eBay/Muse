/**
 * Create in the plugin registry.
 * A plugin is <registry-storage>/plugins/<plugin-name>.yaml
 */

const yaml = require('js-yaml');
const { asyncInvoke, getPluginId, osUsername , validate } = require('../utils');
const { registry } = require('../storage');
const getPlugin = require('./getPlugin');
const schema = require('../schemas/pm/createPlugin.json');
const logger = require('../logger').createLogger('muse.pm.createPlugin');

/**
 * @module muse-core/pm/createPlugin
 */
/**
 * @typedef {object} CreatePluginArgument
 * @property {string} pluginName the plugin name
 * @property {string} [type='normal'] the type of plugin
 * @property {string} [author] default to the current os logged in user
 * @property {object} [options] optional options
 * @property {string} [msg] action message
 */

/**
 *
 * @param {CreatePluginArgument} params args to create new plugin
 * @returns {object} plugin object
 */
module.exports = async (params) => {
  validate(schema, params);
  const ctx = {};
  logger.info(`Creating plugin ${params?.pluginName}...`);
  await asyncInvoke('museCore.pm.beforeCreatePlugin', ctx, params);
  logger.verbose(`Call ext point museCore.pm.beforeCreatePlugin completed`);

  const { pluginName, type = 'normal', author = osUsername, options, msg } = params;

  // Check if plugin name exist
  if (await getPlugin(pluginName)) {
    logger.warn(`Plugin ${pluginName} already exists.`);
    throw new Error(`Plugin ${pluginName} already exists.`);
  }

  const pid = getPluginId(pluginName);
  const pluginKeyPath = `/plugins/${pid}.yaml`;
  ctx.plugin = {
    name: pluginName,
    createdBy: author,
    createdAt: new Date().toJSON(),
    type,
    owners: [author],
    ...options,
  };

  try {
    await asyncInvoke('museCore.pm.createPlugin', ctx, params);
    logger.verbose(`Setting registry storage ${pluginKeyPath}...`);
    await registry.set(
      pluginKeyPath,
      Buffer.from(yaml.dump(ctx.plugin)),
      msg || `Create plugin ${pluginName} by ${author}`,
    );
    logger.verbose(`Set registry storage ${pluginKeyPath} finished.`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedCreatePlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterCreatePlugin', ctx, params);
  logger.info(`Create plugin finished ${params?.pluginName}`);
  return ctx.plugin;
};
