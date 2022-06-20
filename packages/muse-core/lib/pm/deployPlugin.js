const yaml = require('js-yaml');
const _ = require('lodash');
const { validate } = require('schema-utils');
const schema = require('../schemas/pm/deployPlugin.json');
const { asyncInvoke, getPluginId, updateJson, osUsername } = require('../utils');
const { registry } = require('../storage');
const getPlugin = require('./getPlugin');
const { getApp } = require('../am');
const getDeployedPlugin = require('./getDeployedPlugin');
const getReleases = require('./getReleases');

/**
 * @module muse-core/pm/deployplugin
 */
/**
 * @typedef {object} DeployPluginArgument
 * @property {string} appName the app name
 * @property {string} envName the enviroment
 * @property {string} pluginName the plugin name
 * @property {string} [version] the exact version you want to deploy, default by the latest version
 * @property {object} [options]
 * @property {object} [changes]
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 */

/**
 *
 * @param {DeployPluginArgument} params args to delete a plugin
 * @returns {object}
 * @property {string} appName app name
 * @property {string} envName enviroment
 * @property {string} pluginName plugin name
 * @property {string} version deployed plugin version
 */

module.exports = async (params) => {
  validate(schema, params);
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeDeployPlugin', ctx, params);

  const { appName, envName, pluginName, options, changes, author = osUsername, msg } = params;
  let version = params.version;
  // Check if plugin name exist
  const p = await getPlugin(pluginName);
  if (!p) {
    throw new Error(`Plugin ${pluginName} doesn't exist.`);
  }

  // Check if release exists
  const releases = await getReleases(pluginName);
  if (!version) {
    version = releases[0].version;
  } else if (!_.find(releases, { version })) {
    throw new Error(`Version ${version} doesn't exist.`);
  }

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
    console.log(err);
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedDeployPlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterDeployPlugin', ctx, params);
  return {
    appName,
    envName,
    pluginName,
    version,
  };
};
