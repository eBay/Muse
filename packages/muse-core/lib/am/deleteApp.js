// Delete app in the Muse registry.
// A plugin is <registry-storage>/apps/<app-name>.yaml

const yaml = require('js-yaml');
const { asyncInvoke, osUsername } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');

/**
 *
 * @param {DeleteAppArgument} params args to delete an app
 */
module.exports = async (params = {}) => {
  const ctx = {};
  await asyncInvoke('museCore.am.beforeDeleteApp', ctx, params);

  const { appName, author = osUsername, options } = params;
  const appFolder = `/apps/${appName}`;

  ctx.app = {
    name: appName,
    deletedBy: author,
    deletedAt: Date.now(),
    ...options,
  };

  try {
    await asyncInvoke('museCore.am.deleteApp', ctx, params);
    await registry.del(appFolder, `Delete App ${appName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedDeleteApp', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterDeleteApp', ctx, params);
  return ctx.app;
};
