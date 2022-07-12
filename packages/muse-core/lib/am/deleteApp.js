// Delete app in the Muse registry.
// A plugin is <registry-storage>/apps/<app-name>.yaml

const { asyncInvoke, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const schema = require('../schemas/am/deleteApp.json');
const logger = require('../logger').createLogger('muse.am.deleteApp');

/**
 *
 * @param {object} params Args to delete an app.
 * @param {string} params.appName The app name.
 * @param {string} [params.author=osUsername] Default to the current os logged in user.
 *
 */
module.exports = async (params = {}) => {
  validate(schema, params);
  const ctx = {};
  logger.info(`Deleting app ${params.appName}...`);
  await asyncInvoke('museCore.am.beforeDeleteApp', ctx, params);
  const { appName, author = osUsername } = params;

  const appFolder = `/apps/${appName}`;

  try {
    await asyncInvoke('museCore.am.deleteApp', ctx, params);
    await registry.delDir(appFolder, `Delete App ${appName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedDeleteApp', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterDeleteApp', ctx, params);
  logger.info(`Delete app success: ${appName}.`);
  return ctx;
};
