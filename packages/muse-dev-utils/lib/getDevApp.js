const { pkgJson, museConfig } = require('./museContext');
const { getLocalPlugins } = require('./utils');
const muse = require('muse-utils');

module.exports = async () => {
  const { app: appId, env: envName } = museConfig.devConfig;
  // const devAppInfo = await muse.am.getApp(appId);
  // const remotePlugins = museConfig.remotePlugins || [];

  const localPlugins = getLocalPlugins();
  const pluginList = [
    {
      id: [pkgJson, ...localPlugins].map((p) => p.name).join(',') + '@dev',
      url: '/main.js',
    },
  ];

  return {
    appName: appId,
    envName: envName,
    pluginList,
  };
};
