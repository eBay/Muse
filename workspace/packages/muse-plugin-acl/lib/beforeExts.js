const { subject } = require('@casl/ability');
const defineAbilityFor = require('./defineAbilityFor');
const museCore = require('@ebay/muse-core');
const { getUser, assetPermission } = require('./utils');

const checkAppPermission = (action) => async (ctx, { appName, author, changes }) => {
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


const checkReleasePermission =
  (action) =>
  async (ctx, { pluginName, version, author, changes }) => {
    const ability = defineAbilityFor(await getUser(author));
    const plugin = await museCore.pm.getPlugin(pluginName);
    if (!plugin) throw new Error(`Plugin not exist: ${pluginName}`);
    const allReleases = await museCore.pm.getReleases(pluginName);
    if (!allReleases) throw new Error(`Release not exist for plugin: ${pluginName}`);
    const foundRelease = allReleases.find((r) => r.version === version);
    if (!foundRelease) throw new Error(`Release not exist: ${version}`);

    // Fail fast if the user does not belong to the plugin owners
    assetPermission(
      ability.can(action, subject('Plugin', plugin)),
      `No permission to ${action} for release ${version} of plugin ${pluginName} by ${author}.`,
    );

    const paths = [...(changes?.set || []), ...(changes?.remove || []), ...(changes?.push || [])]
      .map((item) => item.path)
      .concat(changes?.unset || []);

    if (!paths.length)
      throw new Error(`No changes provided for release ${version} of plugin ${pluginName}.`);

    // Check if the changes are allowed
    let forbiddenFields = [];
    paths.forEach((path) => {
      const arr = path.split('.');
      if (
        !ability.can(action, subject('Release', { ...foundRelease, owners: plugin.owners }), arr[0])
      ) {
        forbiddenFields.push(arr[0]);
      }
    });

    // If there are forbidden fields, throw an error
    if (forbiddenFields.length) {
      assetPermission(
        false,
        `No permission to update fields "${forbiddenFields.join(', ')}" for release.`,
      );
    }
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
    beforeUpdateRelease: checkReleasePermission('update'),
  },
  req: {
    beforeCreateRequest: null,
  },
};
