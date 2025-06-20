const { asyncInvoke, getPluginId, updateJson, osUsername, validate } = require('../utils');
const getPlugin = require('./getPlugin');
const getDeployedPlugin = require('./getDeployedPlugin');
const { registry } = require('../storage');
const schema = require('../schemas/pm/updateDeployedPlugin.json');
const museData = require('../data');
const yaml = require('js-yaml');
const logger = require('../logger').createLogger('muse.pm.updatePlugin');

/**
 * @module muse-core/pm/updateDeployedPlugin
 */

/**
 *
 * @param {object} params Args to update a deployed plugin.
 * @param {object} params.changesByEnv The items to update.
 * @param {string} params.appName The app name.
 * @param {string} params.pluginName The plugin name.
 * @param {string} [params.author] Default to the current os logged in user.
 * @param {string} [params.msg] Action message.
 * @returns {object} Context.
 */
module.exports = async params => {
  validate(schema, params);

  const ctx = {};
  if (!params.author) params.author = osUsername;

  const { appName, pluginName, changesByEnv, author } = params;
  await asyncInvoke('museCore.pm.beforeUpdateDeployedPlugin', ctx, params);
  logger.info(
    `Updating plugin ${pluginName} on ${appName}@${Object.keys(changesByEnv).join(',')}...`,
  );

  const plugin = await getPlugin(pluginName);
  if (!plugin) {
    throw new Error(`Plugin ${pluginName} doesn't exist.`);
  }
  const pid = getPluginId(pluginName);

  // const fullApp = await museData.get(`muse.app.${appName}`, { noCache: true });
  // if (!fullApp) {
  //   throw new Error(`App ${appName} doesn't exist.`);
  // }

  try {
    const items = await Promise.all(
      Object.entries(changesByEnv).map(async ([envName, changes]) => {
        const deployedPlugin = await getDeployedPlugin(appName, envName, pluginName); // fullApp.envs[envName]?.plugins?.find(p => (p.name = pluginName));
        if (!deployedPlugin) {
          throw new Error(`Plugin ${pluginName} was not found on ${appName}@${envName}.`);
        }
        const updatedDeployedPlugin = updateJson(deployedPlugin, changes);
        return {
          keyPath: `/apps/${appName}/${envName}/${pid}.yaml`,
          value: Buffer.from(yaml.dump(updatedDeployedPlugin)),
        };
      }),
    );
    ctx.items = items;
    await asyncInvoke('museCore.pm.updateDeployedPlugin', ctx, params);
    await registry.batchSet(
      items,
      `Configured plugin ${pluginName} on ${appName}@${Object.keys(changesByEnv).join(
        ',',
      )} by ${author}.`,
    );
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedUpdateDeployedPlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterUpdateDeployedPlugin', ctx, params);
  logger.info(
    `Update deployed plugin success: ${pluginName} on ${appName}@${Object.keys(changesByEnv).join(
      ',',
    )}.`,
  );
  return ctx;
};
