// A plugin is <registry-storage>/plugins/<plugin-name>.yaml

const { asyncInvoke, getPluginId, osUsername } = require('../utils');
const { registry } = require('../storage');

module.exports = async (params) => {
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeDeletePlugin', ctx, params);

  const { pluginName, author = osUsername, msg } = params;

  const pid = getPluginId(pluginName);
  const pluginKeyPath = `/plugins/${pid}.yaml`;

  try {
    await asyncInvoke('museCore.pm.deletePlugin', ctx, params);
    await registry.del(pluginKeyPath, msg || `Delete plugin ${pluginName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedDeletePlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterDeletePlugin', ctx, params);
  return ctx.plugin;
};
