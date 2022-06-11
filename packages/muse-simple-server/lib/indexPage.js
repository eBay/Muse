const muse = require('muse-core');

module.exports = (appName, envName) => async (req, res) => {
  const app = await muse.data.get(`muse.app.${appName}`);
  if (!app) {
    res.send('No app found: ' + appName);
    return;
  }
  if (!app.envs?.[envName]) {
    res.send('No env found: ' + envName);
    return;
  }
  const plugins = app.envs?.[envName]?.plugins;

  const bootPlugin = plugins.find((p) => p.type === 'boot');

  if (!bootPlugin) {
    res.send('No boot plugin.');
    return;
  }
  const museGlobal = {
    appName: appName,
    envName: envName,
    plugins,
    isDev: true,
    pluginList: plugins,
    cdn: '/muse-assets',
    bootPlugin: bootPlugin.name,
  };
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  res.send(`<!doctype html>
  <html lang="en">
  <head>
    <title>${app.title || 'Muse App'}</title>
    <script>
      window.MUSE_GLOBAL = ${JSON.stringify(museGlobal, null, 2)};
    </script>
  </head>
  <body></body>
  <script src="/muse-assets/p/${muse.utils.getPluginId(bootPlugin.name)}/v${
    bootPlugin.version
  }/dist/boot.js"></script>
</html>`);
};
