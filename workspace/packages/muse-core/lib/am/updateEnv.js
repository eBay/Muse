const { asyncInvoke, syncInvoke, updateJson, osUsername, validate } = require('../utils');
const getApp = require('./getApp');
const updateApp = require('./updateApp');
const schema = require('../schemas/am/updateEnv.json');
const logger = require('../logger').createLogger('muse.am.updateEnv');
syncInvoke('museCore.am.processUpdateEnvSchema', schema);

/**
 * @module muse-core/am/updateEnv
 */

/**
 * @param {object} params Args to update an app.
 * @param {string} params.appName The app name.
 * @param {string} params.envName The env name.
 * @param {object} [params.changes]
 * @param {null | object | object[]} [params.changes.set]
 * @param {null | object | object[]} [params.changes.unset]
 * @param {null | object | object[]} [params.changes.remove]
 * @param {null | object | object[]} [params.changes.push]
 * @param {string} params.author Default to the current os logged in user.
 * @param {string} params.msg Action messsage.
 * @returns {object} Env object.
 */
module.exports = async params => {
  validate(schema, params);
  if (!params.author) params.author = osUsername;
  const { appName, envName, changes, author, msg } = params;
  logger.info(`Updating env ${appName}/${envName}...`);
  const ctx = { changes };

  await asyncInvoke('museCore.am.beforeUpdateEnv', ctx, params);

  try {
    ctx.app = await getApp(appName);
    if (!ctx.app) {
      throw new Error(`App ${appName} doesn't exist.`);
    }

    if (!ctx.app?.envs?.[envName]) {
      throw new Error(`Env ${appName}/${envName} doesn't exist.`);
    }

    ctx.env = ctx.app.envs[envName];
    updateJson(ctx.env, changes);
    await asyncInvoke('museCore.am.updateEnv', ctx, params);
    await updateApp({
      appName,
      changes: {
        set: {
          path: `envs.${envName}`,
          value: ctx.env,
        },
      },
      author,
      msg: msg || `Updated env ${appName}/${envName} by ${author}.`,
    });
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedUpdateEnv', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterUpdateEnv', ctx, params);
  logger.info(`Update env success: ${appName}/${envName}.`);
  return ctx.env;
};
