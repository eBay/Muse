const { subject } = require('@casl/ability');
const defineAbilityFor = require('./defineAbilityFor');
const museCore = require('@ebay/muse-core');
const { getUser, assetPermission } = require('./utils');

const checkAppPermission = (action) => async (ctx, { appName, author }) => {
  const ability = defineAbilityFor(await getUser(author));
  const app = await museCore.am.getApp(appName);
  if (!app) throw new Error(`App not exist: ${appName}`);
  assetPermission(
    ability.can(action, subject('App', app)),
    `No permission to ${action} for app ${appName} by ${author}.`,
  );
};

const checkPluginPermission = (action) => async (ctx, { pluginName, author }) => {
  const ability = defineAbilityFor(await getUser(author));
  const plugin = await museCore.pm.getPlugin(pluginName);
  if (!plugin) throw new Error(`Plugin not exist: ${pluginName}`);
  assetPermission(
    ability.can(action, subject('Plugin', plugin)),
    `No permission to ${action} for plugin ${pluginName} by ${author}.`,
  );
};

const checkDeployedPluginPermission = (action) => async (ctx, { appName, pluginName, author }) => {
  const ability = defineAbilityFor(await getUser(author));
  const [app, plugin] = await Promise.all([
    museCore.am.getApp(appName),
    museCore.pm.getPlugin(pluginName),
  ]);
  if (!app) throw new Error(`App not exist: ${appName}`);
  if (!plugin) throw new Error(`Plugin not exist: ${pluginName}`);

  assetPermission(
    ability.can(action, subject('DeployedPlugin', { app, plugin })),
    `No permission to ${action} for plugin ${pluginName} by ${author}.`,
  );
};

module.exports = {
  am: {
    beforeUpdateApp: checkAppPermission('update'),
    beforeDeleteApp: checkAppPermission('delete'),
    beforeCreateEnv: checkAppPermission('create-env'),
    beforeUpdateEnv: checkAppPermission('update-env'),
    beforeDeleteEnv: checkAppPermission('delete-env'),
    beforeSetAppIcon: checkAppPermission('set-app-icon'),
  },
  pm: {
    beforeBuildPlugin: checkPluginPermission('build'),
    beforeUpdatePlugin: checkPluginPermission('update'),
    beforeDeletePlugin: checkPluginPermission('delete'),
    beforeDeleteRelease: checkPluginPermission('delete-release'),
    beforeUnregisterRelease: checkPluginPermission('unregister-release'),
    beforeReleasePlugin: checkPluginPermission('release'),
    beforeDeployPlugin: checkAppPermission('deploy-plugin'),
    beforeUndeployPlugin: checkAppPermission('undeploy-plugin'),
    beforeUpdateDeployedPlugin: checkDeployedPluginPermission('update-deployed-plugin'),
  },
  req: {
    beforeCreateRequest: null,
  },
};
