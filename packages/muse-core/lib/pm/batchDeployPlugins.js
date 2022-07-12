const yaml = require('js-yaml');
const { flatten } = require('lodash');
const schema = require('../schemas/pm/batchDeployPlugins.json');
const { asyncInvoke, getPluginId, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getPlugin = require('./getPlugin');
const { getApp } = require('../am');
const getDeployedPlugin = require('./getDeployedPlugin');
const getDeployedPlugins = require('./getDeployedPlugins');
const checkReleaseVersion = require('./checkReleaseVersion');
const logger = require('../logger').createLogger('muse.pm.batchDeployPlugins');

/**
 * @module muse-core/pm/batchDeployplugins
 */
/**
 * @typedef {object} BachtDeployPluginArgument
 * @property {string} appName the app name
 * @property {object} envMap the environment
 * @property {object[]} envMap.pluginName the plugin name
 * @property {string} envMap.pluginName[].pluginName the plugin name
 * @property {string} envMap.pluginName[].type the plugin name
 * @property {string} [envMap.pluginName[].version] the plugin name
 * @property {string} [author] default to the current os logged in user
 * @property {string} [msg] action message
 */

/**
 *
 * @param {DeployPluginArgument} params args to delete a plugin
 * @returns {object}
 * @property {string} appName app name
 * @property {string} envMap environment
 */

const getFileObj = async ({ appName, envName, type, pluginName, version }) => {
  // Check if plugin name exist
  const p = await getPlugin(pluginName);
  if (!p) {
    throw new Error(`Plugin ${pluginName} doesn't exist.`);
  }
  const versionToDeploy = await checkReleaseVersion({ pluginName, version });
  const pid = getPluginId(pluginName);
  const keyPath = `/apps/${appName}/${envName}/${pid}.yaml`;

  const plugin = (await getDeployedPlugin(appName, envName, pluginName)) || {
    name: pluginName,
  };
  const jsonContent =
    type === 'remove'
      ? null
      : Object.assign(plugin, {
          version: versionToDeploy,
          type: p.type || 'normal',
        });
  const obj = {
    keyPath,
    value: Buffer.from(yaml.dump(jsonContent)),
  };
  return obj;
};

const getAllFilesByEnv = async ({ appName, envName, deployments = [] }) => {
  const newDeployments = deployments?.map(d => ({ ...d, appName, envName }));
  return await Promise.all(newDeployments.map(getFileObj));
};
/**
 * Batch deployment
 * @param {*} params
 * @returns {object}
 */
module.exports = async params => {
  validate(schema, params);
  const ctx = {};
  const { appName, envMap, author = osUsername, msg } = params;
  logger.info(`Batch deployment for ${appName}.`);
  await asyncInvoke('museCore.pm.beforeBatchDeployPlugins', ctx, params);

  const app = await getApp(appName);
  if (!app) {
    throw new Error(`App ${appName} doesn't exist.`);
  }

  const envs = Object.keys(envMap);
  const notExistedEnvName = envs.filter(envName => !app.envs[envName]);
  if (notExistedEnvName.length) {
    throw new Error(`Env ${notExistedEnvName.join(', ')} not exist. Please create it first.`);
  }

  const batchDeployments = await Promise.all(
    envs.map(async envName => {
      const deployedPlugins = (await getDeployedPlugins(appName, envName)) || [];
      const deployedPluginIds = deployedPlugins.map(dp => dp.name);
      const validatedDeployments = envMap[envName].filter(
        d => d.type === 'add' || (d.type === 'remove' && deployedPluginIds.includes(d.pluginName)),
      );
      return {
        appName,
        envName,
        deployments: validatedDeployments,
      };
    }),
  );
  try {
    const items = await Promise.all(batchDeployments.map(getAllFilesByEnv));
    ctx.items = items;
    const flattenItems = flatten(items);
    await asyncInvoke('museCore.pm.batchDeployPlugins', ctx, params);
    await registry.batchSet(
      flattenItems,
      msg || `Deploy multiple plugins to ${appName} by ${author}`,
    );
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedBatchDeployPlugins', ctx, params);
    throw err;
  }

  await asyncInvoke('museCore.pm.afterBatchDeployPlugins', ctx, params);
  logger.info(`Batch deployment success: ${appName}.`);
  return {
    appName,
    envMap,
  };
};
