const { asyncInvoke, jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');

module.exports = async (params) => {
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeGetPlugins', ctx, params);

  try {
    const items = await registry.listWithContent('/plugins');
    ctx.plugins = items.map((item) => jsonByYamlBuff(item.content));
    await asyncInvoke('museCore.pm.getPlugins', ctx, params);
  } catch (err) {
    await asyncInvoke('museCore.pm.failedGetPlugins', ctx, params);
  }

  await asyncInvoke('museCore.pm.afterGetPlugins', ctx, params);
  return ctx.plugins;
};
