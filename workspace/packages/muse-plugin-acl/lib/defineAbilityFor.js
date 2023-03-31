const { AbilityBuilder, Ability } = require('@casl/ability');
const jsPlugin = require('js-plugin');

// NOTE: "manage" and "all" are special keywords in CASL.
// manage represents any action and all represents any subject.
// See: https://casl.js.org/v6/en/guide/intro

module.exports = function defineAbilityFor(user) {
  const { can: allow, cannot: forbid, build } = new AbilityBuilder(Ability);
  user = user || {};
  jsPlugin.invoke('museAcl.beforeDefineAbility', { user, allow, forbid });

  // Muse admin could manage all
  if (user.isMuseAdmin) {
    allow('manage', 'all');
  }

  // Everyone could create app or plugin
  allow('create', 'Plugin');
  allow('create', 'App');

  // Plugin owners can update, build plugin
  // manage means: 'update', 'build', 'config', 'delete'...
  allow('manage', 'Plugin', { owners: user.username });

  // App owners could manage app, envs
  // App owners could also deploy/undeploy plugins for the app
  // manage means: 'update', 'delete', 'create-env', 'update-env', 'delete-env', 'deploy', 'undeploy'...
  allow('manage', 'App', { owners: user.username });

  // For deployed plugin, app owners or plugin owners could manage them
  // manage means: 'edit-config', 'set-variables', ...
  allow('manage', 'DeployedPlugin', {
    'app.owners': user.username,
  });
  allow('manage', 'DeployedPlugin', {
    'plugin.owners': user.username,
  });

  jsPlugin.invoke('museAcl.defineAbility', { user, allow, forbid });
  jsPlugin.invoke('museAcl.afterDefineAbility', { user, allow, forbid });

  return build();
};
