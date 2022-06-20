const { asyncInvoke, jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');
const { validate } = require('schema-utils');
const schema = require('../schemas/am/getApp.json');
const logger = require('../logger').createLogger('muse.am.getApp');

/**
 * @module muse-core/am/getApp
 */

/**
 * @description get conetent of <appName>.yaml
 * @param {string} appName the app name
 * @returns {object} appObject
 */

module.exports = async (appName) => {
  validate(schema, appName);
  const ctx = {};
  logger.info(`Getting app ${appName}...`);
  await asyncInvoke('museCore.am.beforeGetApp', ctx, appName);

  try {
    const keyPath = `/apps/${appName}/${appName}.yaml`;
    ctx.app = jsonByYamlBuff(await registry.get(keyPath));
    await asyncInvoke('museCore.am.getApp', ctx, appName);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedGetApp', ctx, appName);
    throw err;
  }
  await asyncInvoke('museCore.am.afterGetApp', ctx, appName);
  logger.info(`Get app success: ${appName}...`);

  return ctx.app;
};
