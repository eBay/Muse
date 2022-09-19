// Set app icon (png). It's used as app's favicon and loading icon.
const { asyncInvoke, osUsername, validate } = require('../utils');

const assetsStorage = require('../storage/assets');

const getApp = require('./getApp');
const updateApp = require('./updateApp');
const logger = require('../logger').createLogger('muse.am.setAppIcon');
const schema = require('../schemas/am/setAppIcon.json');

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
  validate(schema, params);
  if (!params.author) params.author = osUsername;
  const { appName, icon, author } = params;
  const ctx = {};
  logger.info(`Setting app icon ${appName}...`);
  await asyncInvoke('museCore.am.beforeSetAppIcon', ctx, params);
  const app = await getApp(appName);
  ctx.newIconId = 1;
  if (app.iconId) {
    ctx.newIconId = parseInt(app.iconId || '0', 10) + 1;
  }

  try {
    await asyncInvoke('museCore.am.setAppIcon', ctx, params);
    await assetsStorage.set(`/p/app-icon.${appName}/v0.0.${ctx.newIconId}/dist/icon.png`, icon);
    await updateApp({
      appName,
      changes: {
        set: {
          path: 'iconId',
          value: ctx.newIconId,
        },
      },
      author,
      msg: `Set app icon@${ctx.newIconId} for ${appName} by ${author}.`,
    });
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedSetAppIcon', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterSetAppIcon', ctx, params);

  logger.info(`Set app icon success: icon@${ctx.newIconId} for ${appName}.`);
};
