const { asyncInvoke, updateJson, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');
const schema = require('../schemas/am/updateApp.json');
const logger = require('../logger').createLogger('muse.am.updateApp');

/**
 * @module muse-core/am/updateApp
 */

/**
 * @param {object} params Args to update an app.
 * @param {string} params.appName The app name.
 * @param {object} [params.changes]
 * @param {null | object | object[]} [params.changes.set]
 * @param {null | object | object[]} [params.changes.unset]
 * @param {null | object | object[]} [params.changes.remove]
 * @param {null | object | object[]} [params.changes.push]
 * @param {string} params.author Default to the current os logged in user.
 * @param {string} params.msg Action messsage.
 * @returns {object} App object.
 */
module.exports = async (params) => {
  validate(schema, params);
  const { appName, changes, author = osUsername, msg } = params;
  logger.info(`Updating app ${appName}...`);
  const ctx = {};

  await asyncInvoke('museCore.am.beforeUpdateApp', ctx, params);

  try {
    ctx.app = await getApp(appName);
    if (!ctx.app) {
      throw new Error(`App ${appName} doesn't exist.`);
    }
    updateJson(ctx.app, changes);
    const keyPath = `/apps/${appName}/${appName}.yaml`;
    await asyncInvoke('museCore.am.updateApp', ctx, params);
    const res = await registry.setYaml(
      keyPath,
      ctx.app,
      msg || `Updated app ${appName} by ${author}`,
    );
    ctx.response = res?.data;
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedUpdateApp', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterUpdateApp', ctx, params);
  logger.info(`Update app success: ${appName}.`);
  return ctx.app;
};
