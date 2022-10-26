const { asyncInvoke, syncInvoke, osUsername, validate, jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');
const updateApp = require('./updateApp');
const schema = require('../schemas/am/createEnv.json');
const logger = require('../logger').createLogger('muse.am.createEnv');
syncInvoke('museCore.am.processCreateEnvSchema', schema);

/**
 * @module muse-core/am/createEnv
 */

/**
 * @param {object} params Args to create an env.
 * @param {string} params.appName The app name.
 * @param {string} params.envName The environment of app.
 * @param {string} [params.author = osUsername] Default to the current os logged in user.
 * @param {string} [params.baseEnv] The environment where new environment will copy from. Format: app/env .
 */

module.exports = async (params) => {
  validate(schema, params);
  const ctx = {};
  await asyncInvoke('museCore.am.beforeCreateEnv', ctx, params);
  if (!params.author) params.author = osUsername;
  const { appName, envName, options, author, baseEnv } = params;
  logger.info(`Creating env ${appName}/${envName}...`);

  try {
    ctx.app = await getApp(appName);
    if (!ctx.app) {
      throw new Error(`App ${appName} doesn't exist.`);
    }

    if (ctx.app.envs?.[envName]) {
      throw new Error(`Env ${appName}/${envName} already exists.`);
    }
    let envObject = {
      name: envName,
      createdBy: author,
      createdAt: new Date().toJSON(),
      ...options,
    };
    if (baseEnv) {
      const [baseAppName, baseEnvName] = baseEnv.split('/');

      const baseEnvObject = (await getApp(baseAppName))?.envs?.[baseEnvName];
      if (!baseEnvObject) {
        throw new Error(`Failed to find baseEnv: ${baseEnv}`);
      }

      const pluginsToBeCopied = (await registry.listWithContent(`/apps/${baseEnv}`)).map((file) => {
        return {
          keyPath: `/apps/${appName}/${envName}/${file.name}`,
          value: file.content,
        };
      });

      await registry.batchSet(
        pluginsToBeCopied,
        `Creating env ${appName}/${envName} based on ${baseEnv} by ${author}.`,
      );
      envObject = Object.assign({}, baseEnvObject, envObject);
    }
    ctx.changes = {
      set: {
        path: `envs.${envName}`,
        value: envObject,
      },
    };
    await asyncInvoke('museCore.am.createEnv', ctx, params);
    await updateApp({
      appName,
      changes: ctx.changes,
      author,
      msg: `Created env ${appName}/${envName} by ${author}.`,
    });
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.am.failedCreateEnv', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.am.afterCreateEnv', ctx, params);
  logger.info(`Create env success: ${appName}/${envName}.`);
  return ctx;
};
