const { asyncInvoke, jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');

module.exports = async (params) => {
  const ctx = {};
  await asyncInvoke('museCore.am.beforeGetApps', ctx, params);
  try {
    const items = await registry.listWithContent('/apps');
    ctx.apps = items.map((item) => jsonByYamlBuff(item.content));
    await asyncInvoke('museCore.am.getApps', ctx, params);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedGetApps', ctx, params);
  }
  await asyncInvoke('museCore.am.afterGetApps', ctx, params);
  return ctx.apps;
};
