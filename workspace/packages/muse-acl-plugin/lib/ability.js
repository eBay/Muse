const { defineAbility } = require('@casl/ability');
const customizedAbility = defineAbility(allow => {
  allow('delete', 'plugin', { customizedRole: true });
});

const deployPluginAbility = defineAbility(allow => {
  allow('deploy', 'plugin', { admin: true });
  allow('deploy', 'plugin', { appOwner: true });
  allow('deploy', 'plugin', { pluginOwner: true });
});

const deletePluginAbility = defineAbility(allow => {
  allow('deploy', 'plugin', { admin: true });
  allow('deploy', 'plugin', { pluginOwner: true });
});

module.exports = {
  deployPluginAbility,
  deletePluginAbility,
  customizedAbility,
};
