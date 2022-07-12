const { ForbiddenError, subject } = require('@casl/ability');
const {
  deployPluginAbility: defaultDeployPluginAbility,
  deletePluginAbility: defaultDeletePluginAbility,
  customizedAbility,
} = require('./ability');
const plugin = require('js-plugin');

const {
  errorUnlessCan,
  getAdminMembers,
  getAppMembers,
  getPluginMembers,
  isMember,
} = require('./utils');

module.exports = () => {
  // // for test purpose
  // plugin.register({
  //   name: 'test-extend-acl',
  //   museACL: {
  //     deployPlugin: {
  //       roles: {
  //         custoizedRole: true,
  //       },
  //     },
  //     deletePlugin: {
  //       ability: customizedAbility,
  //     },
  //   },
  // });

  return {
    museCore: {
      am: {
        beforeDeleteApp: async (...args) => {},
      },
      pm: {
        beforeDeployPlugin: async function() {
          const [, params] = arguments;
          const [admins, appOwners, pluginOwners] = await Promise.all([
            getAdminMembers(params),
            getAppMembers(params),
            getPluginMembers(params),
          ]);

          const defaultAuthorizedRoles = {
            admin: isMember(params.author, admins),
            appOwner: isMember(params.author, appOwners),
            pluginOwner: isMember(params.author, pluginOwners),
          };

          const authorizedRoles =
            plugin.invoke('!museACL.deployPlugin.roles')?.[0] || defaultAuthorizedRoles;

          const deployPluginAbility =
            plugin.invoke('!museACL.deployPlugin.ability')?.[0] || defaultDeployPluginAbility;

          const isAllowed = deployPluginAbility.can('deploy', subject('plugin', authorizedRoles));
          errorUnlessCan(isAllowed, authorizedRoles, 'plugin', 'deploy', params);
        },

        deletePlugin: async function(...args) {
          const [, params] = arguments;
          const [admins, pluginOwners] = await Promise.all([
            getAdminMembers(params),
            getPluginMembers(params),
          ]);
          const defaultAuthorizedRoles = {
            admin: isMember(params.author, admins),
            pluginOwner: isMember(params.author, pluginOwners),
          };
          const authorizedRoles =
            plugin.invoke('!museACL.deletePlugin.roles')?.[0] || defaultAuthorizedRoles;

          const deletePluginAbility =
            plugin.invoke('!museACL.deletePlugin.ability')?.[0] || defaultDeletePluginAbility;

          const isAllowed = deletePluginAbility.can('delete', subject('plugin', authorizedRoles));
          errorUnlessCan(isAllowed, authorizedRoles, 'delete', 'deploy', params);
        },
      },
    },
  };
};
