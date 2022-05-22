const _ = require('lodash');
const yaml = require('js-yaml');
const { asyncInvoke, updateJson, osUsername } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');

module.exports = async (params) => {
  const { appName, changes, author = osUsername, msg } = params;
  const ctx = {};

  await asyncInvoke('museCore.am.beforeUpdateApp', ctx, params);

  try {
    ctx.app = await getApp(appName);
    if (!ctx.app) {
      throw new Error(`App ${appName} doesn't exist.`);
    }

    updateJson(ctx.app, changes);

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
