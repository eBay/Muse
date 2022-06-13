const { pkgJson, museConfig } = require('./museContext');
const { getLocalPlugins, getMuseLibs } = require('./utils');
const muse = require('muse-core');

const castArray = (a) => (Array.isArray(a) ? a : [a]);
const getPluginByUrl = (s) => {
  const arr = s.split(':');
  const nameArr = arr[0].split('#');
  const url = arr.slice(1).join(':');

  return {
    name: nameArr[0],
    type: nameArr[1] || 'normal',
    url,
  };
};
module.exports = async () => {
  if (!museConfig?.devConfig) {
    throw new Error(`muse.devConfig section is not found in package.json.`);
  }
  const { app: appName, env: envName = 'staging' } = museConfig.devConfig;
  const app = await muse.data.get(`muse.app.${appName}`);
  const remotePlugins = castArray(museConfig?.devConfig?.remotePlugins || []);
  if (process.env.MUSE_REMOTE_PLUGINS) {
    remotePlugins.push(...process.env.MUSE_REMOTE_PLUGINS.split(';'));
  }

  let plugins = [
    ...app.envs[envName].plugins.filter(
      // boot plugin is always loaded for an app
      (p) =>
        p.core ||
        p.type === 'boot' ||
        remotePlugins.includes('*') ||
        remotePlugins.includes(p.name),
    ),
  ];

  // if a plugin is defined by url like plugin-name:http://localhost:3030/main.js then it's loaded as a plugin
  // it could come from remotePlugins or MUSE_REMOTE_PLUGINS
  const urlPlugins = remotePlugins
    .filter((s) => /:https?:/.test(s)) // for remote plugin loaded by url, should not compile it
    .map(getPluginByUrl);

  // if a plugin is defined by url, then it has higher priority than deployed ones
  plugins = plugins.filter((p) => !urlPlugins.some((up) => up.name === p.name));
  plugins.push(...urlPlugins);

  const localNames = [pkgJson.name];
  const localPlugins = getLocalPlugins();
  localNames.push(...localPlugins.map((p) => p.name));
  const isBoot = museConfig.type === 'boot';
  if (isBoot) {
    // For a boot plugin project, it doesn't use the deployed boot plugin
    plugins = plugins.filter((p) => p.type !== 'boot');
    plugins.unshift({
      name: pkgJson.name,
      dev: true,
      type: 'boot',
      url: '/boot.js',
    });
  } else {
    // boot plugin is loaded directly by HtmlWebpackPlugin
    plugins.push({
      name: localNames.join(','),
      url: '/main.js',
      dev: true,
    });

    // Boot plugin should not depends on libs
    getMuseLibs().forEach((libName) => {
      // Exclude remote lib plugin if it's installed locally
      plugins = plugins.filter((p) => p.name !== libName);
      plugins.push({
        name: libName,
        version: require(libName + '/package.json').version,
        url: `/_muse_static/local/p/${muse.utils.getPluginId(libName)}/dev/main.js`,
      });
    });
  }

  const bootPlugins = plugins.filter((p) => p.type === 'boot');
  if (bootPlugins.length === 0) throw new Error('No boot plugin found.');
  if (bootPlugins.length > 1) {
    throw new Error(`Multiple boot plugins found: $${bootPlugins.map((p) => p.name).join(', ')}`);
  }

  return {
    appName: appName,
    envName: envName,
    bootPlugin: bootPlugins[0].name,
    // By default boot plugin loades prod plugins, other plugin loads dev bundles
    // Unless boot plugin is configured to load dev bundles by museConfig.bootDev
    isDev: isBoot && !museConfig.bootDev ? false : true,
    plugins,
    cdn: '/_muse_static',
  };
};
