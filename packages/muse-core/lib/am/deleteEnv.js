const { asyncInvoke, osUsername } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');
const updateApp = require('./updateApp');

module.exports = async (params) => {
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
    // delete the envName from the app's yaml configuration
    await updateApp({
      appName,
      changes: ctx.changes,
      author,
      msg: `Delete env ${appName}/${envName} by ${author}.`,
    });
    const keyPath = `/apps/${appName}/${envName}`;
    // delete the envName itself.
    // we don't care about underlying Storage implementation, just call registry.del() API
    await registry.del(keyPath, `Delete env ${appName}/${envName} by ${author}.`);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedDeleteEnv', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterDeleteEnv', ctx, params);
  return ctx.app;
};
