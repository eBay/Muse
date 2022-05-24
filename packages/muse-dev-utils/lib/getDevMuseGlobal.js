const { pkgJson, museConfig } = require('./museContext');
const { getLocalPlugins, getMuseLibs } = require('./utils');
const muse = require('muse-core');

module.exports = async () => {
  const { app: appName, env: envName = 'staging' } = museConfig.devConfig;
  const app = await muse.cache.get(`muse.app.${appName}`);
  const remotePlugins = museConfig?.devConfig?.remotePlugins || [];

  const plugins = [
    ...app.envs[envName].plugins.filter(
      (p) => p.type === 'boot' || remotePlugins === '*' || remotePlugins === p.name || remotePlugins.includes(p.name),
    ),
  ];

  const localNames = [pkgJson.name];
  const localPlugins = getLocalPlugins();
  localNames.push(...localPlugins.map((p) => p.name));
  plugins.push({
    name: localNames.join(','),
    version: 'local',
    url: '/main.js',
  });

  getMuseLibs().forEach((libName) => {
    plugins.push({
      name: libName,
      version: require(libName + '/package.json').version,
      url: `/_muse_static/local/p/${muse.utils.getPluginId(libName)}/dev/main.js`,
    });
  });

  return {
    appName: appName,
    envName: envName,
    bootPlugin: plugins.find((p) => p.type === 'boot').name,
    isDev: true,
    plugins,
    appEntries: [],
    pluginEntries: [],
    cdn: '/_muse_static',
  };
};
