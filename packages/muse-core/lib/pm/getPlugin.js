const { asyncInvoke, getPluginId } = require('../utils');
const { registry } = require('../storage');

module.exports = async (pluginName) => {
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeGetPlugin', ctx, pluginName);

  // TODO: upload resources to static storage

  await asyncInvoke('museCore.pm.getPlugin', ctx, pluginName);
  const pid = getPluginId(pluginName);
  const keyPath = `/plugins/${pid}.yaml`;

  try {
    ctx.result = await registry.getJsonByYaml(keyPath);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedGetPlugin', ctx, pluginName);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterGetPlugin', ctx, pluginName);
  return ctx.result;
};
