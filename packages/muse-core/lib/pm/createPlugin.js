// Create in the plugin registry.
// A plugin is <registry-storage>/plugins/<plugin-name>.yaml

const yaml = require('js-yaml');
const { asyncInvoke, getPluginId, osUsername, createLogger } = require('../utils');
const { registry } = require('../storage');
const getPlugin = require('./getPlugin');

const logger = createLogger('muse.pm.createPlugin');

module.exports = async (params) => {
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
    logger.error(`Failed to set registry storage ${pluginKeyPath}: ${JSON.stringify(params)} .`);
    await asyncInvoke('museCore.pm.failedCreatePlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterCreatePlugin', ctx, params);
  logger.info(`Create plugin finished ${params?.pluginName}`);
  return ctx.plugin;
};
