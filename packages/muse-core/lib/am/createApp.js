// Create app in the Muse registry.
// A plugin is <registry-storage>/apps/<app-name>.yaml

const yaml = require('js-yaml');
const { asyncInvoke } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');

module.exports = async (params = {}) => {
  const ctx = {};
  await asyncInvoke('museCore.am.beforeCreateApp', ctx, params);

  const { appName, author, options } = params;

  if (await getApp(appName)) {
    throw new Error(`App ${appName} already exists.`);
  }

  const appKeyPath = `/apps/${appName}/${appName}.yaml`;
  ctx.app = {
    name: appName,
    createdBy: author,
    createdAt: Date.now(),
    owners: [author],
    ...options,
  };

  try {
    await asyncInvoke('museCore.am.createApp', ctx, params);
    await registry.set(appKeyPath, Buffer.from(yaml.dump(ctx.app)), `Create plugin ${appName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedCreateApp', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterCreateApp', ctx, params);
};
