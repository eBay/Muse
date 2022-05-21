const _ = require('lodash');
const yaml = require('js-yaml');
const { asyncInvoke } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');

module.exports = async (params) => {
  const { appName, deltaApp, author, msg } = params;
  const ctx = {};

  await asyncInvoke('museCore.am.beforeUpdateApp', ctx, params);

  try {
    ctx.app = await getApp(appName);

    // set: [{ path, value }, ...]
    // unset: [path1, path2, ...]
    // push: [{ path, value }] // for array
    // remove: [{ path, predicate, value }, ...]
    const { set = [], unset = [], remove = [], push = [] } = deltaApp;
    set.forEach((item) => {
      _.set(ctx.app, item.path, item.value);
    });

    unset.forEach((p) => {
      _.unset(ctx.app, p);
    });

    push.forEach((item) => {
      const arr = _.get(ctx.app, item.path);
      if (!arr) _.set(ctx.app, item.path, []);
      arr.push(item.value);
    });

    remove.forEach((item) => {
      const obj = _.get(ctx.app, item.path);
      if (!obj) return;
      if (item.value) _.remove(obj, item.value);
      if (item.predicate) _.pull(obj, item.predicate);
    });

    const keyPath = `/apps/${appName}/${appName}.yaml`;
    await asyncInvoke('museCore.am.updateApp', ctx, params);
    await registry.set(keyPath, Buffer.from(yaml.dump(ctx.app)), msg || `Update app ${appName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedUpdateApp', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterUpdateApp', ctx, params);
  return ctx.app;
};
