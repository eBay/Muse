const { syncInvoke, asyncInvoke, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');
const createEnv = require('./createEnv');
const schema = require('../schemas/am/createApp.json');
const logger = require('../logger').createLogger('muse.am.createApp');
syncInvoke('museCore.am.processCreateAppSchema', schema);

/**
 * @module muse-core/am/createApp
 */

/**
 * @description Create an application in the Muse registry.
 * A app is [registry-storage]/apps/[app-name].yaml
 * @param {object} params The arguments to create an app.
 * @param {string} params.appName The app name.
 * @param {string} [params.author=osUsername] The author who performs the action, default to the current os logged in user.
 */
module.exports = async (params = {}) => {
  validate(schema, params);
  const ctx = {};
  if (!params.author) params.author = osUsername;
  const { appName, envName = 'staging', author, owners, options } = params;
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
    await registry.setYaml(appKeyPath, ctx.app, `Created app ${appName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedCreateApp', ctx, params);
    // Whenever throw an error, don't log it.
    throw err;
  }
  await asyncInvoke('museCore.am.afterCreateApp', ctx, params);
  logger.info(`Create app success: ${appName}.`);

  if (envName) {
    logger.verbose(`Creating env when app created: ${envName}.`);
    await createEnv({ appName: ctx.app.name, envName, author });
    ctx.app.envs = (await getApp(appName)).envs;
  }

  return ctx.app;
};
