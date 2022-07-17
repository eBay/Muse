// Set app icon (png). It's used as app's favicon and loading icon.

const assetsStorage = require('../storage/assets');
const { osUsername } = require('../utils');
const getApp = require('./getApp');
const updateApp = require('./updateApp');
const logger = require('../logger').createLogger('muse.am.setAppIcon');

/**
 * @module muse-core/am/setAppIcon
 */

/**
 * @description Set the icon for the app.
 * A app is [registry-storage]/apps/[app-name].yaml
 * @param {object} params The arguments to create an app.
 * @param {string} params.appName The app name.
 * @param {object} params.icon The png file buffer.
 */
module.exports = async (params = {}) => {
  const { appName, icon, author = osUsername } = params;
  logger.info(`Setting app icon ${appName}...`);
  const app = await getApp(appName);
  let newIconId = 1;
  if (app.iconId) {
    try {
      // Delete old icon
      await assetsStorage.del(`/p/app-assets.${appName}/v0.0.0/dist/icon-${app.iconId}.png`);
    } catch (err) {
      logger.error(`Failed to delete app icon-${app.iconId}: ${appName}`);
    }
    newIconId = parseInt(app.iconId || '0', 10) + 1;
  }
  await assetsStorage.set(`/p/app-assets.${appName}/v0.0.0/dist/icon-${newIconId}.png`, icon);
  await updateApp({
    appName,
    changes: {
      set: {
        path: 'iconId',
        value: newIconId,
      },
    },
    msg: `Set app icon of ${appName} by ${author}.`,
  });
  logger.info(`Set app icon success: icon-${newIconId}@${appName}.`);
};
