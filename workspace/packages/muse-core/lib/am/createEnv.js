const _ = require('lodash');
const { asyncInvoke, osUsername, validate, jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');
const getApp = require('./getApp');
const updateApp = require('./updateApp');
const schema = require('../schemas/am/createEnv.json');
const logger = require('../logger').createLogger('muse.am.createEnv');

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

module.exports = async params => {
  validate(schema, params);
  const { appName, envName, options, author = osUsername, baseEnv } = params;
  logger.info(`Creating env ${appName}/${envName}...`);
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
    const newEnvObject = {
      name: envName,
      createdBy: author,
      createdAt: new Date().toJSON(),
      ...options,
    };
    let baseEnvObject;
    let copyFrom;
    const setBaseEnvObjectFromEnvPath = async path => {
      const [copyFromApp, copyFromEnv] = path.split('/');
      if (!copyFromApp || !copyFromEnv) {
        logger.info(`The format of copy from is wrong, should be like: appName/envName.`);
        return;
      }
      baseEnvObject = jsonByYamlBuff(await registry.get(`/apps/${copyFromApp}/${copyFromApp}.yaml`))
        .envs[copyFromEnv];
      if (baseEnvObject) {
        logger.info(`Retrieve configuration from base environment ${path} successfully.`);
        copyFrom = path;
      } else {
        logger.info(`Failed to retrieve configuration from base environment ${path}.`);
      }
    };
    if (baseEnv) {
      await setBaseEnvObjectFromEnvPath(baseEnv);
    }
    if (!baseEnvObject && ctx.defaultEnvTemplate) {
      await setBaseEnvObjectFromEnvPath(ctx.defaultEnvTemplate);
    }
    if (baseEnvObject) {
      const pluginsToBeCopied = (await registry.listWithContent(`/apps/${copyFrom}`)).map(
        plugin => {
          return { keyPath: `/apps/${appName}/${envName}/${plugin.name}`, value: plugin.content };
        },
      );

      await registry.batchSet(
        pluginsToBeCopied,
        `Copy multiple plugins from ${copyFrom} to ${appName}/${envName} by ${author}`,
      );
    }
    ctx.changes = {
      set: {
        path: `envs.${envName}`,
        value: _.merge(baseEnvObject, newEnvObject),
      },
    };
    await asyncInvoke('museCore.am.createEnv', ctx, params);
    await updateApp({
      appName,
      changes: ctx.changes,
      author,
      msg: `Create env ${appName}/${envName} by ${author}.`,
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
