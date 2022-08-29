const yaml = require('js-yaml');
const { flatten } = require('lodash');
const schema = require('../schemas/pm/deployPlugin.json');
const { asyncInvoke, getPluginId, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getPlugin = require('./getPlugin');
const { getApp } = require('../am');
const getDeployedPlugin = require('./getDeployedPlugin');
const getDeployedPlugins = require('./getDeployedPlugins');
const checkReleaseVersion = require('./checkReleaseVersion');
const logger = require('../logger').createLogger('muse.pm.batchDeployPlugins');

/**
 * @module muse-core/pm/deployPlugin
 */

const getFileObj = async ({ appName, envName, type, pluginName, version, options }) => {
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
          ...options,
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
 * Compatible with single and multiple deployments
 * @param {object} params args to deploy a plugin
 * @param {string} params.appName the app name
 * @param {object} params.envMap the environmentMap
 * @param {object[]} params.envMap.
 * @param {string} params.envMap.[].pluginName the plugin name
 * @param {string} params.envMap.[].type the plugin name
 * @param {string} [params.envMap.[].version] the plugin name
 * @param {object} [params.envMap.[].options] the plugin name
 * @param {string} [author] default to the current os logged in user
 * @param {string} [msg] action message
 * @returns {object}
 */
module.exports = async params => {
  if (!params.author) params.author = osUsername;
  const { appName, envName, pluginName, author, options, msg } = params;
  let isBatchDeploy;
  let version;
  let envMap = params.envMap;
  if (envName && pluginName) {
    isBatchDeploy = false;
    version = await checkReleaseVersion({ pluginName, version: params.version });
    envMap = { ...envMap, [envName]: [{ pluginName, type: 'add', version, options }] };
    params.envMap = envMap;
  } else {
    isBatchDeploy = true;
  }
  validate(schema, params);
  const ctx = {};

  logger.info(
    isBatchDeploy
      ? `Batch deployment for ${appName}.`
      : `Deploying plugin ${pluginName}@${params.version || 'latest'} to ${appName}/${envName}...`,
  );
  console.log('params: ', params);
  await asyncInvoke('museCore.pm.beforeDeployPlugin', ctx, params);

  const app = await getApp(appName);
  if (!app) {
    throw new Error(`App ${appName} doesn't exist.`);
  }

  const envs = Object.keys(envMap);
  const notExistedEnvNames = envs.filter(envName => !app.envs[envName]);
  if (notExistedEnvNames.length) {
    throw new Error(`Env ${notExistedEnvNames.join(', ')} not exist. Please create it first.`);
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
    await asyncInvoke('museCore.pm.deployPlugin', ctx, params);
    await registry.batchSet(
      flattenItems,
      msg || isBatchDeploy
        ? `Deployed multiple plugins to ${appName} by ${author}`
        : `Deployed plugin ${pluginName}@${version} to ${appName}/${envName} by ${author}`,
    );
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedDeployPlugin', ctx, params);
    throw err;
  }

  await asyncInvoke('museCore.pm.afterDeployPlugin', ctx, params);

  logger.info(
    isBatchDeploy
      ? `Batch deployment success: ${appName}.`
      : `Deploy plugin success: ${pluginName}@${version} to ${appName}/${envName}...`,
  );
  return {
    appName,
    envMap,
    version,
    envName,
    pluginName,
  };
};
