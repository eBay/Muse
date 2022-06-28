const { asyncInvoke, osUsername, validate } = require('../utils');
const getApp = require('./getApp');
const updateApp = require('./updateApp');
// const { validate } = require('schema-utils');
const schema = require('../schemas/am/createEnv.json');
const logger = require('../logger').createLogger('muse.am.createEnv');

/**
 * @module muse-core/am/createEnv
 */

/**
 * @typedef {object} CreateEnvArgument
 * @property {string} appName the app name
 * @property {string} envName the environment of app
 * @property {string} [author = osUsername] default to the current os logged in user
 */

/**
 *
 * @param {CreateEnvArgument} params args to create an env
 */
module.exports = async (params) => {
  validate(schema, params);
  const { appName, envName, options, author = osUsername } = params;
  logger.info(`Creating env ${appName}/${envName}...`);
  const ctx = {};

  await asyncInvoke('museCore.am.beforeCreateEnv', ctx, params);

  try {
    ctx.app = await getApp(appName);
    if (!ctx.app) {
      throw new Error(`App ${appName} doesn't exist.`);
    }

    if (ctx.app.envs?.[envName]) {
      throw new Error(`Env ${appName}/${envName} already exists.`);
    }

    ctx.changes = {
      set: {
        path: `envs.${envName}`,
        value: { name: envName, createdBy: author, createdAt: new Date().toJSON(), ...options },
      },
    };
    await asyncInvoke('museCore.am.createEnv', ctx, params);
    await updateApp({
      appName,
      changes: ctx.changes,
      author,
      msg: `Create env ${appName}/${envName} by ${author}.`,
    });
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedCreateEnv', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterCreateEnv', ctx, params);
  logger.info(`Create env success: ${appName}/${envName}.`);
  return ctx;
};
