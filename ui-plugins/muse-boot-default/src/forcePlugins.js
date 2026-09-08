const PLUGIN_TYPES = new Set(['boot', 'init', 'lib', 'normal']);
const UNNAMED_PLUGIN = /^[a-zA-Z0-9._-]+$/;
const SCOPED_PLUGIN = /^@[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export function isValidPluginName(name) {
  return typeof name === 'string' && (UNNAMED_PLUGIN.test(name) || SCOPED_PLUGIN.test(name));
}

export function isValidPluginType(type) {
  return PLUGIN_TYPES.has(type);
}

export function isValidPluginVersion(version) {
  return version === 'null' || (typeof version === 'string' && SEMVER.test(version));
}

/**
 * forcePlugins is for local/dev and Muse e2e. Staging/production user traffic
 * leaves it off so URL query params cannot swap plugins.
 */
export function isForcePluginsAllowed({ isDev, isLocal, isE2eTest } = {}) {
  return Boolean(isDev || isLocal || isE2eTest);
}

export function parseForcePlugins(forcePluginStr) {
  if (!forcePluginStr) return {};
  return forcePluginStr
    .split(';')
    .filter(Boolean)
    .reduce((acc, entry) => {
      const separator = '@';
      let prefix = '';
      let value = entry;
      if (value.startsWith('@')) {
        value = value.substring(1);
        prefix = '@';
      }
      const arr = value.split(separator, 2);
      if (arr.length !== 2) return acc;
      const [name, type] = arr[0].split('!');
      const pluginName = `${prefix}${name}`;
      acc[pluginName] = {
        version: arr[1],
        type,
      };
      return acc;
    }, {});
}

function warnIgnored(reason) {
  console.warn(`[muse-boot] Ignoring forcePlugins entry: ${reason}`);
}

export function applyForcePlugins(plugins, forcePluginStr) {
  const forcePluginById = parseForcePlugins(forcePluginStr);
  const remaining = { ...forcePluginById };

  const next = plugins
    .map((plugin) => {
      const forced = remaining[plugin.name];
      if (!forced) return plugin;
      delete remaining[plugin.name];
      if (!isValidPluginVersion(forced.version)) {
        warnIgnored(`invalid version for ${plugin.name}`);
        return plugin;
      }
      if (forced.type && !isValidPluginType(forced.type)) {
        warnIgnored(`invalid type for ${plugin.name}`);
        return plugin;
      }
      return { ...plugin, version: forced.version };
    })
    .filter((plugin) => plugin.version !== 'null');

  for (const name of Object.keys(remaining)) {
    const forced = remaining[name];
    if (forced.version === 'null') continue;
    if (
      !isValidPluginName(name) ||
      !isValidPluginType(forced.type) ||
      !isValidPluginVersion(forced.version)
    ) {
      warnIgnored(`invalid name, type, or version for ${name}`);
      continue;
    }
    next.push({
      name,
      type: forced.type,
      version: forced.version,
    });
  }

  return next;
}
