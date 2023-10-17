const { AbilityBuilder, PureAbility } = require('@casl/ability');
const jsPlugin = require('js-plugin');

// NOTE: "manage" and "all" are special keywords in CASL.
// manage represents any action and all represents any subject.
// See: https://casl.js.org/v6/en/guide/intro

const lambdaMatcher = (matchConditions) => matchConditions;
const fieldMatcher = (fields) => (field) => fields.includes(field);

// const isPluginDeployed = ({ app, plugin }) => {
//   return Object.values(app.envs).some((env) => env.plugins?.some((p) => p.name === plugin.name));
// };

module.exports = function defineAbilityFor(user) {
  const { can: allow, cannot: forbid, build } = new AbilityBuilder(PureAbility);
  user = user || {};

  const isOwnerOf = (obj) => obj?.owners?.includes(user.username);
  jsPlugin.invoke('museAcl.beforeDefineAbility', { user, allow, forbid });

  // Muse admin could manage all
  if (user.isMuseAdmin) {
    allow('manage', 'all');
  }

  // Everyone could create app or plugin
  allow('create', 'Plugin');
  allow('create', 'App');

  // Plugin owners can update, build plugin
  // manage means all action, eg: 'update', 'build', 'config', 'delete'...
  allow('manage', 'Plugin', isOwnerOf);

  // App owners could manage app, envs
  // App owners could also deploy/undeploy plugins for the app
  // manage means: 'update', 'delete', 'create-env', 'update-env', 'delete-env', 'deploy', 'undeploy'...
  // NOTE: deploy, undeploy is an app permission
  allow('manage', 'App', isOwnerOf);

  // If app owned plugin, app owners can manage the plugin too
  allow('manage', 'Plugin', ({ app, plugin }) => {
    return (
      // Plugin owners can manage
      isOwnerOf(plugin) ||
      // App owners can manage if plugin.app === app.name
      (plugin?.app === app?.name && isOwnerOf(app))
    );
  });

  // For deployed plugin, app owners or plugin owners could manage them
  // manage means: 'edit-config', 'set-variables', ...
  allow('config', 'Plugin', ({ app, plugin }) => {
    return isOwnerOf(plugin) || isOwnerOf(app);
  });

  // Plugin owners have permission to config the plugin
  // Which means they can update specified fields of the app
  // So it's an update app permission case.
  // NOTE: this is usually for server side check, client side should check it with allow('config', 'Plugin') to have better performance
  allow('update', 'App', ({ app, plugin, changes }) => {
    if (isOwnerOf(app)) return true;
    if (!isOwnerOf(plugin)) return false;
    const paths = [...(changes?.set || []), ...(changes?.remove || []), ...(changes?.push || [])]
      .map((item) => item.path)
      .concat(changes?.unset || []);

    return paths.every((path) => {
      const arr = path.split('.');

      // Allow to set env level plugin config and variables
      if (
        arr[0] === 'envs' &&
        ['pluginConfig', 'pluginVariables'].includes(arr[2]) &&
        arr[3] === plugin.name
      ) {
        return true;
      }

      // Allow to set app level plugin config and variables
      if (['pluginConfig', 'pluginVariables'].includes(arr[0]) && arr[1] === plugin.name) {
        return true;
      }
      return false;
    });
  });

  jsPlugin.invoke('museAcl.defineAbility', { user, allow, forbid });
  jsPlugin.invoke('museAcl.afterDefineAbility', { user, allow, forbid });

  return build({
    conditionsMatcher: lambdaMatcher,
    fieldMatcher,
  });
};
