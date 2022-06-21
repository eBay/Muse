const { asyncInvoke, updateJson, osUsername } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');
const { validate } = require('schema-utils');
const schema = require('../schemas/am/updateApp.json');
const logger = require('../logger').createLogger('muse.am.updateApp');

/**
 * @module muse-core/am/updateApp
 */

/**
 * @typedef {object} UpdateAppArgument
 * @property {string} appName the app name
 * @property {object} [changes]
 * @property {null | object | object[]} [changes.set]
 * @property {null | object | object[]} [changes.unset]
 * @property {null | object | object[]} [changes.remove]
 * @property {null | object | object[]} [changes.push]
 * @property {string} author default to the current os logged in user
 * @property {string} msg action messsage
 */

/**
 *
 * @param {UpdateAppArgument} params args to update an app
 * @returns {object} app object
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
    await registry.setYaml(keyPath, ctx.app, msg || `Update app ${appName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedUpdateApp', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterUpdateApp', ctx, params);
  logger.info(`Update app success: ${appName}.`);
  return ctx.app;
};
