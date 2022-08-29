const { ForbiddenError, subject } = require('@casl/ability');
const defineAbilityFor = require('./defineAbilityFor');
const jsPlugin = require('js-plugin');
const museCore = require('@ebay/muse-core');

// const {
//   errorUnlessCan,
//   getAdminMembers,
//   getAppMembers,
//   getPluginMembers,
//   isMember,
// } = require('./utils');

const assetPermission = (allowed, msg = 'No permission.') => {
  if (!allowed) {
    const err = new Error(msg);
    err.code = 403;
    throw err;
  }
  return true;
};

const getUser = async username => {
  if (!username) return null;
  const admins = await museCore.data.get('muse.admins');
  console.log('admins: ', admins);
  return {
    username,
    isMuseAdmin: admins?.includes(username),
  };
};

const checkApp = action => async (ctx, { appName, author }) => {
  const ability = defineAbilityFor(await getUser(author));
  const app = await museCore.am.getApp(appName);
  assetPermission(
    ability.can(action, subject('App', app)),
    `No permission to ${action} for app ${appName} by ${author}.`,
  );
};

const checkPlugin = action => async (ctx, { pluginName, author }) => {
  const ability = defineAbilityFor(await getUser(author));
  const plugin = await museCore.pm.getPlugin(pluginName);
  assetPermission(
    ability.can(action, subject('App', app)),
    `No permission to ${action} for plugin ${pluginName} by ${author}.`,
  );
};

module.exports = {
  am: {
    beforeUpdateApp: checkApp('update'),
    beforeDeleteEnv: checkApp('delete-env'),
    beforeCreateEnv: checkApp('create-env'),
    beforeDeleteEnv: checkApp('delete-env'),
  },
  pm: {
    beforeDeployPlugin: checkApp('deploy-plugin'),
    deletePlugin: checkPlugin('delete'),
    // beforeDeployPlugin: async function() {
    //   const [, params] = arguments;

    //   const valid = async (params, { admins, appOwners, pluginOwners }) => {
    //     const defaultAuthorizedRoles = {
    //       admin: isMember(params.author, admins),
    //       appOwner: isMember(params.author, appOwners),
    //       pluginOwner: isMember(params.author, pluginOwners),
    //     };

    //     const authorizedRoles =
    //       plugin.invoke('!museACL.deployPlugin.roles')?.[0] || defaultAuthorizedRoles;

    //     const deployPluginAbility =
    //       plugin.invoke('!museACL.deployPlugin.ability')?.[0] || defaultDeployPluginAbility;

    //     const isAllowed = deployPluginAbility.can('deploy', subject('plugin', authorizedRoles));
    //     errorUnlessCan(isAllowed, authorizedRoles, 'plugin', 'deploy', params);
    //   };

    //   const deployments = Object.values(params?.envMap || []);

    //   const [
    //     { value: admins },
    //     { value: appOwners },
    //     ...pluginOwnerObjcts
    //   ] = await Promise.allSettled([
    //     getAdminMembers(params),
    //     getAppMembers(params),
    //     ...deployments.map(getPluginMembers),
    //   ]);

    //   await Promise.all(
    //     pluginOwnerObjcts.map(
    //       async ({ value }) => await valid(params, { admins, appOwners, pluginOwners: value }),
    //     ),
    //   );
    // },

    // deletePlugin: async function(...args) {
    //   const [, params] = arguments;
    //   const [{ value: admins }, { value: pluginOwners }] = await Promise.allSettled([
    //     getAdminMembers(params),
    //     getPluginMembers(params),
    //   ]);
    //   const defaultAuthorizedRoles = {
    //     admin: isMember(params.author, admins),
    //     pluginOwner: isMember(params.author, pluginOwners),
    //   };

    //   const authorizedRoles =
    //     plugin.invoke('!museACL.deletePlugin.roles')?.[0] || defaultAuthorizedRoles;
    //   const deletePluginAbility =
    //     plugin.invoke('!museACL.deletePlugin.ability')?.[0] || defaultDeletePluginAbility;

    //   const isAllowed = deletePluginAbility.can('delete', subject('plugin', authorizedRoles));
    //   errorUnlessCan(isAllowed, authorizedRoles, 'plugin', 'delete', params);
    // },
  },
};
