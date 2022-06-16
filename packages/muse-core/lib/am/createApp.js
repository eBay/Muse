const { asyncInvoke, osUsername } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');
const { validate } = require('schema-utils');
const schema = require('../schemas/am/createApp.json');

/**
 * @module muse-core/am/createApp
 */

/**
 * @typedef {object} CreateAppArgument
 * @property {string} appName the app name
 * @property {string} [author=osUsername] default to the current os logged in user
 */

/**
 * @description Create app in the Muse registry.
 * A app is <registry-storage>/apps/<app-name>.yaml
 * @param {CreateAppArgument} params args to create an app
 */
module.exports = async (params = {}) => {
  validate(schema, params);
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
    await registry.setYaml(appKeyPath, ctx.app, `Create plugin ${appName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedCreateApp', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterCreateApp', ctx, params);
  return ctx.app;
};
