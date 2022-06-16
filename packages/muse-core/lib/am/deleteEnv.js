const { asyncInvoke, osUsername } = require('../utils');
const getApp = require('./getApp');
const updateApp = require('./updateApp');
const { validate } = require('schema-utils');
const schema = require('../schemas/am/deleteEnv.json');

/**
 * @module muse-core/am/deleteEnv
 */

/**
 * @typedef {object} DeleteEnvArgument
 * @property {string} appName the app name
 * @property {string} envName the enviroment of app
 * @property {string} [author=osUsername] default to the current os logged in user
 */

/**
 *
 * @param {DeleteEnvArgument} params args to create an env
 * @returns {object} app
 */
module.exports = async (params) => {
  validate(schema, params);
  const { appName, envName, author = osUsername } = params;
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
    await updateApp({
      appName,
      changes: ctx.changes,
      author,
      msg: `Delete env ${appName}/${envName} by ${author}.`,
    });
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedDeleteEnv', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterDeleteEnv', ctx, params);
  return ctx.app;
};
