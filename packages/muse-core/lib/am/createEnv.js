const { asyncInvoke } = require('../utils');

const getApp = require('./getApp');
const updateApp = require('./updateApp');

module.exports = async (params) => {
  const { appName, envName, options, author } = params;
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
        value: { name: envName, createdBy: author, createdAt: Date.now(), ...options },
      },
    };
    await asyncInvoke('museCore.am.createEnv', ctx, params);
    await updateApp({ appName, changes: ctx.changes, author, msg: `Create env ${appName}/${envName} by ${author}.` });
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedCreateEnv', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterCreateEnv', ctx, params);
  return ctx.app;
};
