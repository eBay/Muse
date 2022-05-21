// Create in the plugin registry.
// A plugin is <registry-storage>/plugins/<plugin-name>.yaml

const yaml = require('js-yaml');
const { asyncInvoke, getPluginId } = require('../utils');
const { registry } = require('../storage');
const getPlugin = require('./getPlugin');

module.exports = async (params) => {
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeCreatePlugin', ctx, params);

  const { pluginName, author, options } = params;

  // Check if plugin name exist
  if (await getPlugin(pluginName)) {
    throw new Error(`Plugin ${pluginName} already exists.`);
  }

  const pid = getPluginId(pluginName);
  const pluginKeyPath = `/plugins/${pid}.yaml`;
  ctx.plugin = {
    name: pluginName,
    createdBy: author,
    owners: [author],
    ...options,
  };

  try {
    await asyncInvoke('museCore.pm.createPlugin', ctx, params);
    await registry.set(pluginKeyPath, Buffer.from(yaml.dump(ctx.plugin)), `Create plugin ${pluginName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedCreatePlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterCreatePlugin', ctx, params);
};
