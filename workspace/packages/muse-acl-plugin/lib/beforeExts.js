const { subject } = require('@casl/ability');
const defineAbilityFor = require('./defineAbilityFor');
const museCore = require('@ebay/muse-core');
const { getUser } = require('./utils');

const assetPermission = (allowed, msg = 'No permission.') => {
  if (!allowed) {
    const err = new Error(msg);
    err.code = 403;
    throw err;
  }
  return true;
};

const checkAppPermission = action => async (ctx, { appName, author }) => {
  const ability = defineAbilityFor(await getUser(author));
  const app = await museCore.am.getApp(appName);
  assetPermission(
    ability.can(action, subject('App', app)),
    `No permission to ${action} for app ${appName} by ${author}.`,
  );
};

const checkPluginPermission = action => async (ctx, { pluginName, author }) => {
  const ability = defineAbilityFor(await getUser(author));
  const plugin = await museCore.pm.getPlugin(pluginName);
  assetPermission(
    ability.can(action, subject('App', plugin)),
    `No permission to ${action} for plugin ${pluginName} by ${author}.`,
  );
};

module.exports = {
  am: {
    beforeUpdateApp: checkAppPermission('update'),
    beforeDeleteApp: checkAppPermission('delete-app'),
    beforeCreateEnv: checkAppPermission('create-env'),
    beforeDeleteEnv: checkAppPermission('delete-env'),
  },
  pm: {
    beforeDeployPlugin: checkAppPermission('deploy-plugin'),
    beforeDeletePlugin: checkPluginPermission('delete'),
  },
};
