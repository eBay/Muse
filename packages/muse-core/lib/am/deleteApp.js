// Delete app in the Muse registry.
// A plugin is <registry-storage>/apps/<app-name>.yaml

const { asyncInvoke, osUsername  } = require('../utils');
const { registry } = require('../storage');
const logger = require('../logger').createLogger('muse.am.deleteApp');

/**
 *
 * @param {DeleteAppArgument} params args to delete an app
 */
module.exports = async (params = {}) => {
  const ctx = {};
  logger.info(`Deleting app ${params.appName}...`);
  await asyncInvoke('museCore.am.beforeDeleteApp', ctx, params);
  const { appName, author = osUsername } = params;

  const appFolder = `/apps/${appName}`;

  try {
    await asyncInvoke('museCore.am.deleteApp', ctx, params);
    await registry.del(appFolder, `Delete App ${appName} by ${author}`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedDeleteApp', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterDeleteApp', ctx, params);
  logger.info(`Delete app success: ${appName}.`);
  return ctx;
};
