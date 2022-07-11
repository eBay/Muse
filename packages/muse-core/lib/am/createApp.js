const { asyncInvoke, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');
const schema = require('../schemas/am/createApp.json');
const logger = require('../logger').createLogger('muse.am.createApp');

/**
 * @module muse-core/am/createApp
 */

/**
 * @description Create app in the Muse registry.
 * A app is <registry-storage>/apps/<app-name>.yaml
 * @param {object} params Args to create an app.
 * @param {string} params.appName The app name.
 * @param {string} [params.author=osUsername] Default to the current os logged in user.
 */
module.exports = async (params = {}) => {
  validate(schema, params);
  const ctx = {};
  const { appName, author = osUsername, options } = params;
  logger.info(`Creating app ${appName}...`);
  await asyncInvoke('museCore.am.beforeCreateApp', ctx, params);

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
    await registry.setYaml(appKeyPath, ctx.app, `Create ${appName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedCreateApp', ctx, params);
    // Whenever throw an error, don't log it.
    throw err;
  }
  await asyncInvoke('museCore.am.afterCreateApp', ctx, params);
  logger.info(`Create app success: ${appName}.`);

  return ctx.app;
};
