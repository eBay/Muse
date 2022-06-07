const { asyncInvoke, jsonByYamlBuff, getPluginId } = require('../utils');
const { registry } = require('../storage');

module.exports = async (pluginName) => {
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeGetReleases', ctx, pluginName);

  const pid = getPluginId(pluginName);
  const keyPath = `/plugins/releases/${pid}.yaml`;

  try {
    ctx.result = jsonByYamlBuff(await registry.get(keyPath)) || [];
    await asyncInvoke('museCore.pm.getReleases', ctx, pluginName);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedGetReleases', ctx, pluginName);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterGetReleases', ctx, pluginName);
  return ctx.result;
};
