const _ = require('lodash');
const museCore = require('@ebay/muse-core');
const logger = museCore.logger.createLogger('muse-express-middleware.app');
const path = require('path');

const defaultTemplate = `
<!doctype html>
<html lang="en">
<head>
  <title><%= title %></title>
  <link rel="shortcut icon" href="/favicon.png" />
  <script>
    window.MUSE_GLOBAL = <%= museGlobal %>;
  </script>
</head>
<body></body>
<script src="/muse-assets/p/<%= bootPluginId %>/v<%= bootPluginVersion %>/dist/boot.js"></script>
</html>
`;

const getAppInfoByUrl = async req => {
  const appByUrl = await museCore.data.get('muse.app-by-url');
  const host = req.get('host');
  const fullPath = path.join(req.baseUrl || '/', req.path);
  // fullurl example: 'www.example.com/foo/bar'
  const fullUrl = host + fullPath;
  let matchedUrl;
  if (appByUrl[host]) {
    matchedUrl = host;
  } else {
    matchedUrl = Object.keys(appByUrl).find(u => {
      const uPath = u.endsWith('/') ? u : u + '/';
      return (
        // example.com equals example.com
        u === host ||
        // /foo equals /foo
        u === fullPath ||
        // example.com/foo/bar startsWith example.com/foo/
        fullUrl.startsWith(uPath) ||
        // /foo/bar startsWith /foo/
        fullPath.startsWith(uPath)
      );
    });
  }
  if (!matchedUrl) {
    return null;
  }
  return appByUrl[matchedUrl];
};

module.exports = ({
  appName,
  envName,
  cdn = '/muse-assets',
  isDev = false,
  template = defaultTemplate,
  byUrl = false,
}) => {
  if (!appName && !envName && !byUrl) {
    throw new Error('appName/envName or byUrl should be set.');
  }
  return async (req, res, next) => {
    if (byUrl) {
      const appInfo = await getAppInfoByUrl(req);
      logger.info(`App info by url: ${JSON.stringify(appInfo)}`);

      if (!appInfo) {
        // res.statusCode = 400;
        // res.write(
        //   `Error: unable to detect Muse app by: ${req.get('host') + (req.originalUrl || '/')}`,
        // );
        // res.end();
        return next();
      }
      appName = appInfo.appName;
      envName = appInfo.envName;
    } else {
      logger.info(`Getting app by specified ${appName}/${envName}`);
    }

    logger.info(`Getting full app data: ${appName}`);
    const app = await museCore.data.get(`muse.app.${appName}`);
    if (!app) {
      res.send('No app found: ' + appName);
      return;
    }
    if (!app.envs?.[envName]) {
      res.send('No env found: ' + envName);
      return;
    }
    const plugins = app.envs?.[envName]?.plugins;

    const bootPlugins = plugins.filter(p => p.type === 'boot');

    if (bootPlugins.length === 0) {
      return res.send('No boot plugin.');
    } else if (bootPlugins.length > 1) {
      return res.send(
        `There should be only one boot plugin, found ${bootPlugins.length}: ${bootPlugins.map(
          p => p.name,
        )}`,
      );
    }

    const bootPlugin = bootPlugins[0];
    const museGlobal = {
      appName: appName,
      envName: envName,
      plugins,
      isDev,
      cdn,
      bootPlugin: bootPlugin.name,
    };
    logger.info(`Muse global: ${JSON.stringify(museGlobal)}`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    res.write(
      _.template(template)({
        title: app.title || 'Muse App',
        bootPluginId: museCore.utils.getPluginId(bootPlugin.name),
        bootPluginVersion: bootPlugin.version,
        museGlobal: JSON.stringify(museGlobal),
      }),
    );
    res.end();
  };
};
