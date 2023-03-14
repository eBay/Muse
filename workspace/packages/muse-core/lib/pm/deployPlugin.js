const yaml = require('js-yaml');
const { flatten, find } = require('lodash');
const schema = require('../schemas/pm/deployPlugin.json');
const { asyncInvoke, getPluginId, osUsername, validate } = require('../utils');
const { registry } = require('../storage');
const getPlugin = require('./getPlugin');
const { getApp } = require('../am');
const getDeployedPlugin = require('./getDeployedPlugin');
const getDeployedPlugins = require('./getDeployedPlugins');
const checkReleaseVersion = require('./checkReleaseVersion');
const logger = require('../logger').createLogger('muse.pm.deployPlugin');

/**
 * @module muse-core/pm/deployPlugin
 */

// const getFileObj = async ({ appName, envName, type, pluginName, version, options }) => {
//   // Check if plugin name exist
//   const p = await getPlugin(pluginName);
//   if (!p) {
//     throw new Error(`Plugin ${pluginName} doesn't exist.`);
//   }
//   const versionToDeploy = await checkReleaseVersion({ pluginName, version });
//   const pid = getPluginId(pluginName);
//   const keyPath = `/apps/${appName}/${envName}/${pid}.yaml`;

//   const plugin = (await getDeployedPlugin(appName, envName, pluginName)) || {
//     name: pluginName,
//   };
//   const jsonContent =
//     type === 'remove'
//       ? null
//       : Object.assign(plugin, {
//           version: versionToDeploy,
//           type: p.type || 'normal',
//           ...options,
//         });
//   const obj = {
//     keyPath,
//     value: (jsonContent && Buffer.from(yaml.dump(jsonContent))) || null,
//   };
//   return obj;
// };

// const getAllFilesByEnv = async ({ appName, envName, deployments = [] }) => {
//   // const newDeployments = deployments?.map((d) => ({ ...d, appName, envName }));
//   return await Promise.all(
//     deployments.map((d) => {
//       const p = await getPlugin(pluginName);
//   if (!p) {
//     throw new Error(`Plugin ${pluginName} doesn't exist.`);
//   }
//   const versionToDeploy = await checkReleaseVersion({ pluginName, version });
//   const pid = getPluginId(pluginName);
//   const keyPath = `/apps/${appName}/${envName}/${pid}.yaml`;

//   const plugin = (await getDeployedPlugin(appName, envName, pluginName)) || {
//     name: pluginName,
//   };
//   const jsonContent =
//     type === 'remove'
//       ? null
//       : Object.assign(plugin, {
//           version: versionToDeploy,
//           type: p.type || 'normal',
//           ...options,
//         });
//   const obj = {
//     keyPath,
//     value: (jsonContent && Buffer.from(yaml.dump(jsonContent))) || null,
//   };
//   return obj;
//       getFileObj({ appName, envName, ...d });
//     }),
//   );
// };

/**
 * Compatible with single and multiple deployments
 * @param {object} params args to deploy a plugin
 * @param {string} params.appName the app name
 * @param {object} params.envMap the environmentMap
 * @param {object[]} params.envMap.
 * @param {string} params.envMap.[].pluginName the plugin name
 * @param {string} params.envMap.[].type add or remove
 * @param {string} [params.envMap.[].version] the plugin name
 * @param {object} [params.envMap.[].options]
 * @param {string} [author] default to the current os logged in user
 * @param {string} [msg] action message
 * @returns {object}
 */
module.exports = async (params) => {
  if (!params.author) params.author = osUsername;
  const { appName, envName, pluginName, author, options, msg } = params;
  let version;
  let envMap = params.envMap;
  if (envName && pluginName) {
    envMap = {
      [envName]: [
        {
          pluginName,
          version: params.version,
          type: 'add',
        },
      ],
    };
    envMap = { ...envMap, [envName]: [{ pluginName, type: 'add', version, options }] };
    params.envMap = envMap;
  }

  if (!envMap) throw new Error('Invalid params: ' + JSON.stringify(params));
  validate(schema, params);
  const ctx = {};
  // const allPlugins = flatten(Object.values(envMap));
  // if (!allPlugins.length) throw new Error('No plugins specified for deployment.');
  // const ctx = {
  //   // If only deployed one plugin to one env, then it's not group deploy
  //   isSingleDeploy: allPlugins.length === 1,
  // };
  // ctx.isSingleAdd = ctx.isSingleDeploy && allPlugins[0].type === 'add';
  // ctx.isSingleRemove = ctx.isSingleDeploy && allPlugins[0].type === 'remove';

  logger.info(`Deploying plugin(s): ${JSON.stringify(envMap)}`);

  await asyncInvoke('museCore.pm.beforeDeployPlugin', ctx, params);

  const app = await getApp(appName);
  if (!app) {
    throw new Error(`App ${appName} doesn't exist.`);
  }

  // Validate if envs in envMap exist
  Object.keys(envMap).forEach((envName) => {
    if (!app.envs[envName]) throw new Error(`Env ${envName} doesn't exist on app ${appName}.`);
  });

  // Validate only existing plugin could be removed
  await Promise.all(
    Object.keys(envMap).map(async (envName) => {
      const pluginsToRemove = envMap[envName].filter((p) => p.type === 'remove');
      if (pluginsToRemove.length) {
        const deployedPlugins = (await getDeployedPlugins(appName, envName)) || [];
        pluginsToRemove.forEach((p) => {
          if (!find(deployedPlugins, (dp) => dp.name === p.name)) {
            throw new Error(
              `Can't remove plugin ${p.name} because it has not been deployed to ${appName}/${envName}.`,
            );
          }
        });
      }
    }),
  );

  // Flattened deployments
  const flattenedDeployments = flatten(
    Object.entries(envMap).map(([envName, pluginsToDeploy]) => {
      return pluginsToDeploy.map((ptd) => {
        return {
          envName,
          deployment: ptd,
        };
      });
    }),
  ).sort((p1, p2) => {
    if (p1.type === p2.type) {
      return p1.pluginName.localeCompare(p2.pluginName);
    }
    if (p1.type === 'add') return -1;
    return 1;
  });

  // Check release versions if deploy a plugin:
  //  1. if version provided, check if it exists
  //  2. if version not provided, use the latest release version.
  await Promise.all(
    flattenedDeployments.map(async (d) => {
      if (d.deployment.type === 'remove') return;
      d.deployment.version = await checkReleaseVersion({
        pluginName: d.deployment.pluginName,
        version: d.deployment.version,
      });
    }),
  );

  const messages = [];
  try {
    const items = await Promise.all(
      flattenedDeployments.map(async ({ envName, deployment: { pluginName, version, type } }) => {
        // Check if plugin name exist
        const p = await getPlugin(pluginName);
        if (!p) {
          throw new Error(`Plugin ${pluginName} doesn't exist.`);
        }
        const pid = getPluginId(pluginName);
        const keyPath = `/apps/${appName}/${envName}/${pid}.yaml`;

        let deployedPlugin = await getDeployedPlugin(appName, envName, pluginName);

        if (type === 'add') {
          // it means submit a new plugin
          messages.push(
            `${
              deployedPlugin ? 'Deployed ' : 'Submitted'
            } plugin ${pluginName}@${version} to ${appName}/${envName} by ${author}.`,
          );
          deployedPlugin = {
            name: pluginName,
          };
        } else {
          messages.push(
            `Undeployed plugin ${pluginName}@${deployedPlugin?.version} from ${appName}/${envName} by ${author}.`,
          );
        }
        const jsonContent =
          type === 'remove'
            ? null
            : Object.assign(deployedPlugin, {
                version,
                type: p.type || 'normal',
                ...options,
              });
        const obj = {
          keyPath,
          value: jsonContent ? Buffer.from(yaml.dump(jsonContent)) : null,
        };
        return obj;
      }),
    );
    ctx.items = items;

    await asyncInvoke('museCore.pm.deployPlugin', ctx, params);
    await registry.batchSet(
      items,
      messages.length > 1 ? `Deployed multiple plugins to ${appName} by ${author}.` : messages[0],
    );
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedDeployPlugin', ctx, params);
    throw err;
  }

  await asyncInvoke('museCore.pm.afterDeployPlugin', ctx, params);

  logger.info(`Deployment succeeded to ${appName}:`);
  messages.forEach((msg) => logger.info(msg));

  return {
    ctx,
    appName,
    envMap,
    version,
    envName,
    pluginName,
    messages,
  };
};
