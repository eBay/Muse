const { pkgJson, museConfig } = require('./museContext');
const { getLocalPlugins, getMuseLibs, getPluginId } = require('./utils');
const muse = require('muse-core');

module.exports = async () => {
  const { app: appName, env: envName = 'staging' } = museConfig.devConfig;
  const app = await muse.am.getApp(appName);
  const remotePlugins = museConfig?.devConfig?.remotePlugins || [];

  const pluginList = [
    ...app.envs[envName].pluginList.filter(
      (p) => p.type === 'boot' || remotePlugins === '*' || remotePlugins === p.name || remotePlugins.includes(p.name),
    ),
  ];

  const localNames = [pkgJson.name];
  const localPlugins = getLocalPlugins();
  localNames.push(...localPlugins.map((p) => p.name));
  pluginList.push({
    name: localNames.join(','),
    version: 'local',
    url: '/main.js',
  });

  getMuseLibs().forEach((libName) => {
    pluginList.push({
      name: libName,
      version: require(libName + '/package.json').version,
      url: `/_muse_static/local/p/${getPluginId(libName)}/dev/main.js`,
    });
  });

  return {
    appName: appName,
    envName: envName,
    isDev: true,
    pluginList,
    appEntries: [],
    pluginEntries: [],
    cdn: '/_muse_static',
  };
};
