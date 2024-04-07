const yaml = require('js-yaml');

const { flatten, find, uniq, castArray } = require('lodash');
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
 * @param {string} [options] only used when deploying a plugin without using envMap
 * @param {string} [msg] action message
 * @returns {object}
 */
module.exports = async (params) => {
  if (!params.author) params.author = osUsername;
  const { appName, envName, pluginName, version, author, options, msg } = params;
  let theMsg = msg;

  // If single plugin on one or multiple envs, this is a shortcut API
  if (envName && pluginName) {
    params.envMap = castArray(envName).reduce((p, c) => {
      return {
        ...p,
        [c]: [
          {
            pluginName,
            version,
            type: 'add',
            options,
          },
        ],
      };
    }, {});
  }

  const envMap = params.envMap;

  if (!envMap) throw new Error('Invalid params: ' + JSON.stringify(params));
  validate(schema, params);
  const ctx = {};

  logger.info(`Deploying plugin(s): ${JSON.stringify(envMap)}`);

  await asyncInvoke('museCore.pm.beforeDeployPlugin', ctx, params);

  const app = await getApp(appName);
  if (!app) {
    throw new Error(`App ${appName} doesn't exist.`);
  }

  // Validate if envs in envMap exist
  Object.keys(envMap).forEach((envName) => {
    if (!app.envs?.[envName]) throw new Error(`Env ${envName} doesn't exist on app ${appName}.`);
  });

  // Validate only existing plugin could be removed
  await Promise.all(
    Object.keys(envMap).map(async (envName) => {
      const pluginsToRemove = envMap[envName].filter((p) => p.type === 'remove');
      if (pluginsToRemove.length) {
        const deployedPlugins = (await getDeployedPlugins(appName, envName)) || [];
        pluginsToRemove.forEach((p) => {
          if (!find(deployedPlugins, (dp) => dp.name === p.pluginName)) {
            throw new Error(
              `Can't remove plugin ${p.pluginName} because it has not been deployed to ${appName}/${envName}.`,
            );
          }
        });
      }
    }),
  );

  // Flattened deployments
  // For example:
  //  [
  //    { envName: 'staging', deployment: { pluginName: 'muse-lib-react', type: 'add', version: '1.0.1' }},
  //    { envName: 'production', deployment: { pluginName: 'muse-lib-react', type: 'add', version: null }},
  //  ]
  // Note: if version not provided or null, means latest
  const flattenedDeployments = flatten(
    Object.entries(envMap).map(([envName, pluginsToDeploy]) => {
      return pluginsToDeploy.map((ptd) => {
        return {
          envName,
          deployment: ptd,
        };
      });
    }),
  ).sort(({ deployment: d1 }, { deployment: d2 }) => {
    // Sort deployments for friendly messages
    if (d1.type === d2.type) {
      return d1.pluginName.localeCompare(d2.pluginName);
    }
    if (d1.type === 'add') return -1;
    return 1;
  });

  // Normalize deployed versions if deploy a plugin:
  //  1. if version provided, check if it exists
  //  2. if version not provided, use the latest release version.
  await Promise.all(
    flattenedDeployments.map(async (d) => {
      if (d.deployment.type === 'remove') return;
      // TODO(perf-improve) if same plugin on multiple envs, will do duplicated checkReleaseVersion
      d.deployment.version = await checkReleaseVersion({
        pluginName: d.deployment.pluginName,
        version: d.deployment.version,
      });
    }),
  );

  const messages = [];
  try {
    const items = await Promise.all(
      flattenedDeployments.map(async (fd) => {
        const {
          envName,
          deployment: { pluginName, version, type },
        } = fd;
        // Check if plugin name exist
        // TODO(perf-improve): if same plugin on multiple envs, will do duplicated getPlugin
        const p = await getPlugin(pluginName);
        if (!p) {
          throw new Error(`Plugin ${pluginName} doesn't exist.`);
        }
        const pid = getPluginId(pluginName);
        const keyPath = `/apps/${appName}/${envName}/${pid}.yaml`;

        let deployedPlugin = await getDeployedPlugin(appName, envName, pluginName);

        if (!deployedPlugin) {
          // First deployment, is used to generate messages
          fd.deployment.isNew = true;
        } else {
          fd.deployment.deployedVersion = deployedPlugin.version;
        }
        if (type === 'add') {
          // it means submit a new plugin or update version
          messages.push(
            `${
              deployedPlugin ? 'Deployed ' : 'Submitted'
            } ${pluginName}@${version} to ${appName}/${envName} by ${author}.`,
          );
          if (!deployedPlugin) {
            // new deployment
            deployedPlugin = {
              name: pluginName,
            };
          }
        } else {
          messages.push(
            `Undeployed ${pluginName}@${deployedPlugin?.version} from ${appName}/${envName} by ${author}.`,
          );
        }
        const jsonContent =
          type === 'remove'
            ? null
            : Object.assign(deployedPlugin, {
                version,
                type: p.type || 'normal',
                ...fd.deployment?.options,
              });
        const obj = {
          keyPath,
          value: jsonContent ? Buffer.from(yaml.dump(jsonContent)) : null,
        };
        return obj;
      }),
    );

    // All changes in items
    ctx.items = items;
    await asyncInvoke('museCore.pm.deployPlugin', ctx, params);
    if (!theMsg) {
      // If a plugin with same version same type on multiple envs
      const pluginChanges = uniq(
        flattenedDeployments.map(
          ({ deployment: d }) =>
            `${d.isNew ? 'add ' : 'updated '}${d.type} ${d.pluginName}@${d.version}.`,
        ),
      );
      if (messages.length === 0) {
        theMsg = 'No changes for deploy plugin.';
      } else if (messages.length === 1) {
        theMsg = messages[0];
      } else if (pluginChanges.length === 1) {
        // Means a single plugin deployed/undeployed to/from multiple envs
        const d0 = flattenedDeployments[0].deployment;
        theMsg = `${d0.type === 'add' ? (d0.isNew ? 'Submitted' : 'Deployed') : 'Undeployed'} ${
          d0.pluginName
        }${d0.version ? '@' + d0.version : ''} ${
          d0.type === 'add' ? 'to' : 'from'
        } ${appName}/${flattenedDeployments.map((fd) => fd.envName).join(', ')} by ${author}.`;
      } else {
        theMsg = `Deployed multiple changes to ${appName} by ${author}.`;
      }
    }
    const res = await registry.batchSet(items, theMsg);
    ctx.response = res?.data;
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedDeployPlugin', ctx, params);
    throw err;
  }

  await asyncInvoke('museCore.pm.afterDeployPlugin', ctx, params);

  logger.info(`Deployment succeeded to ${appName}:`);
  messages.forEach((message) => logger.info(message));

  return {
    ctx,
    appName,
    envMap,
    version,
    envName,
    pluginName,
    messages,
    msg: theMsg,
  };
};
