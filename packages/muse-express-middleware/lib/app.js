const _ = require('lodash');
const muse = require('muse-core');

const defaultTemplate = `
<!doctype html>
<html lang="en">
<head>
  <title>${app.title || 'Muse App'}</title>
  <link rel="shortcut icon" href="/favicon.png" />
  <script>
    window.MUSE_GLOBAL = ${JSON.stringify(museGlobal, null, 2)};
  </script>
</head>
<body></body>
<script src="/muse-assets/p/${muse.utils.getPluginId(bootPlugin.name)}/v${
  bootPlugin.version
}/dist/boot.js"></script>
</html>
`;

module.exports =
  ({ appName, envName, isDev, template = defaultTemplate }) =>
  async (req, res) => {
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
      isDev: !!isDev,
      cdn: '/muse-assets',
      bootPlugin: bootPlugin.name,
    };
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    res.send(`<!doctype html>
  <html lang="en">
  <head>
    <title>${app.title || 'Muse App'}</title>
    <link rel="shortcut icon" href="/favicon.png" />
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
