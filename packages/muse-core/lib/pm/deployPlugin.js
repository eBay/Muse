const yaml = require('js-yaml');
const _ = require('lodash');
const schema = require('../schemas/pm/deployPlugin.json');
const { asyncInvoke, getPluginId, updateJson, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getPlugin = require('./getPlugin');
const { getApp } = require('../am');
const getDeployedPlugin = require('./getDeployedPlugin');
const checkReleaseVersion = require('./checkReleaseVersion');
const logger = require('../logger').createLogger('muse.pm.deployPlugin');

/**
 * @module muse-core/pm/deployplugin
 */

/**
 *
 * @param {object} params Args to delete a plugin.
 * @param {string} params.appName The app name.
 * @param {string} params.envName The environment.
 * @param {string} params.pluginName The plugin name.
 * @param {string} [params.version] The exact version you want to deploy, default by the latest version.
 * @param {object} [params.options]
 * @param {object} [params.changes]
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 * @returns {object}
 * @property {string} appName App name.
 * @property {string} envName Environment.
 * @property {string} pluginName Plugin name.
 * @property {string} version Deployed plugin version.
 */

module.exports = async params => {
  validate(schema, params);
  const ctx = {};
  const { appName, envName, pluginName, options, changes, author = osUsername, msg } = params;
  logger.info(
    `Deploying plugin ${pluginName}@${params.version || 'latest'} to ${appName}/${envName}...`,
  );
  await asyncInvoke('museCore.pm.beforeDeployPlugin', ctx, params);

  // Check if plugin name exist
  const p = await getPlugin(pluginName);
  if (!p) {
    throw new Error(`Plugin ${pluginName} doesn't exist.`);
  }

  // Check if release version exists (throws exception if no version/release found)
  let version = await checkReleaseVersion({ pluginName, version: params.version });

  const app = await getApp(appName);
  if (!app) {
    throw new Error(`App ${appName} doesn't exist.`);
  }

  if (!app.envs?.[envName]) {
    throw new Error(`Env ${appName}/${envName} doesn't exist.`);
  }

  try {
    const pid = getPluginId(pluginName);
    const keyPath = `/apps/${appName}/${envName}/${pid}.yaml`;
    ctx.plugin = (await getDeployedPlugin(appName, envName, pluginName)) || { name: pluginName };
    Object.assign(ctx.plugin, {
      version,
      type: p.type || 'normal',
      ...options,
    });
    updateJson(ctx.plugin, changes || {});
    await asyncInvoke('museCore.pm.deployPlugin', ctx, params);
    await registry.set(
      keyPath,
      Buffer.from(yaml.dump(ctx.plugin)),
      msg || `Deploy plugin ${pluginName} to ${appName}/${envName} by ${author}`,
    );
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedDeployPlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterDeployPlugin', ctx, params);
  logger.info(`Deploy plugin success: ${pluginName}@${version} to ${appName}/${envName}...`);

  return {
    appName,
    envName,
    pluginName,
    version,
  };
};
