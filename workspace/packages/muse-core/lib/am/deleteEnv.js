const { asyncInvoke, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');
const updateApp = require('./updateApp');
const schema = require('../schemas/am/deleteEnv.json');
const logger = require('../logger').createLogger('muse.am.deleteEnv');

/**
 * @module muse-core/am/deleteEnv
 */

/**
 *
 * @param {object} params Args to create an env.
 * @param {string} params.appName The app name.
 * @param {string} params.envName The environment of app.
 * @param {string} [params.author = osUsername] Default to the current os logged in user.
 * @returns {object} App.
 */
module.exports = async params => {
  validate(schema, params);
  const { appName, envName, author = osUsername } = params;
  logger.info(`Deleting env ${appName}/${envName}...`);
  const ctx = {};

  await asyncInvoke('museCore.am.beforeDeleteEnv', ctx, params);

  try {
    ctx.app = await getApp(appName);
    if (!ctx.app) {
      throw new Error(`App ${appName} doesn't exist.`);
    }

    ctx.changes = {
      unset: `envs.${envName}`,
    };
    await asyncInvoke('museCore.am.deleteEnv', ctx, params);
    // remove the envName configuration from the app's yaml configuration
    await updateApp({
      appName,
      changes: ctx.changes,
      author,
      msg: `Remove env ${appName}/${envName} by ${author}.`,
    });
    const keyPath = `/apps/${appName}/${envName}`;
    // delete the envName itself, using underlying Storage implementation
    ctx.result = await registry.delDir(keyPath, `Delete env ${appName}/${envName} by ${author}.`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedDeleteEnv', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterDeleteEnv', ctx, params);
  logger.info(`Delete env success: ${appName}/${envName}.`);
  return ctx.app;
};
