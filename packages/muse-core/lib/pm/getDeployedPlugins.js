const { asyncInvoke, jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');

module.exports = async (appName, envName) => {
  const ctx = {};

  await asyncInvoke('museCore.pm.beforeGetDeployedPlugins', ctx, appName, envName);

  try {
    const items = await registry.listWithContent(`/apps/${appName}/${envName}`);
    ctx.plugins = items.map((item) => jsonByYamlBuff(item.content));
    await asyncInvoke('museCore.pm.getDeployedPlugins', ctx, appName, envName);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedGetDeployedPlugins', ctx, appName, envName);
  }

  await asyncInvoke('museCore.pm.afterGetDeployedPlugins', ctx, appName, envName);
  return ctx.plugins;
};
