// Create app in the Muse registry.
// A plugin is <registry-storage>/apps/<app-name>.yaml

const yaml = require('js-yaml');
const { asyncInvoke, osUsername } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');

/**
 * @typedef {Object} CreateAppArgument
 * @property {string} appName how the person is called
 * @property {string} author default to the current os logged in user
 */

/**
 *
 * @param {CreateAppArgument} params args to create an app
 */
module.exports = async (params = {}) => {
  const ctx = {};
  await asyncInvoke('museCore.am.beforeCreateApp', ctx, params);

  const { appName, author = osUsername, options } = params;

  if (await getApp(appName)) {
    throw new Error(`App ${appName} already exists.`);
  }

  const appKeyPath = `/apps/${appName}/${appName}.yaml`;
  ctx.app = {
    name: appName,
    createdBy: author,
    createdAt: new Date().toJSON(),
    owners: [author],
    ...options,
  };

  try {
    await asyncInvoke('museCore.am.createApp', ctx, params);
    await registry.set(
      appKeyPath,
      Buffer.from(yaml.dump(ctx.app)),
      `Create app ${appName} by ${author}`,
    );
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedCreateApp', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterCreateApp', ctx, params);
  return ctx.app;
};
