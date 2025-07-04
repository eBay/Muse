const _ = require('lodash');
const museCore = require('@ebay/muse-core');
const fs = require('fs');
const logger = museCore.logger.createLogger('muse-express-middleware.app');
const path = require('path');
// const crypto = require('crypto');
// const requestIp = require('request-ip');

const defaultTemplate = `
<!doctype html>
<html lang="en">
<head>
  <title><%= title %></title>
  <link rel="shortcut icon" href="<%= favicon %>" />
  <script>
    window.MUSE_GLOBAL = <%= museGlobal %>;
  </script>
</head>
<body></body>
<script src="<%= bootPluginUrl %>" type="<%= bootType %>"></script>
</html>
`;

const getAppInfoByUrl = async (req) => {
  const appByUrl = await museCore.data.get('muse.app-by-url');
  const host = req.get('host');
  const fullPath = path.join(req.baseUrl || '/', req.path);
  // fullurl example: 'www.example.com/foo/bar'
  const fullUrl = host + fullPath;
  let matchedUrl;
  if (appByUrl[host]) {
    matchedUrl = host;
  } else {
    matchedUrl = Object.keys(appByUrl).find((u) => {
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

const populateAppVariables = (app, env) => {
  const appDefaultVars = app?.variables || {};
  const appCurrentEnvVars = env?.variables || {};
  const mergedAppVariables = {
    ...appDefaultVars,
    ...appCurrentEnvVars,
  };
  return mergedAppVariables;
};

const populatePluginVariables = (app, env) => {
  const mergedPluginVariables = {};
  for (const pluginConf of env.plugins) {
    const pluginDefaultVars = pluginConf.variables || {};
    const pluginAppVars = app?.pluginVariables?.[pluginConf.name] || {};
    const pluginCurrentEnvVars = env?.pluginVariables?.[pluginConf.name] || {};
    mergedPluginVariables[pluginConf.name] = {
      ...pluginDefaultVars,
      ...pluginAppVars,
      ...pluginCurrentEnvVars,
    };
  }

  return mergedPluginVariables;
};

// This middleware is at least used by:
// - muse-vite-plugin
// - muse-craco-pulgin
// - production server
// It needs to be compatible with all of them, note vite doesn't use express but connect
module.exports = ({
  appName,
  envName = 'staging',
  cdn = '/muse-assets',
  isDev = false,
  isLocal = false,
  template = defaultTemplate,
  byUrl = false,
  serviceWorker = '/muse-sw.js', // If not use service worker, set it to false
  serviceWorkerCacheName = 'muse_assets',
  variables = {},
  pluginVariables = {},
  defaultFavicon,
}) => {
  let swContent = fs.readFileSync(path.join(__dirname, './sw.js')).toString();
  if (serviceWorkerCacheName) {
    // Simply replace cacheName if necessary
    // If your old cache has some issues, you may need to change cacheName to invalidate all old cache
    swContent = swContent.replace(
      "const cacheName = 'muse_assets';",
      `const cacheName = '${serviceWorkerCacheName}';`,
    );
  }
  return async (req, res, next) => {
    // a default favicon

    let reqPath = req.path; // from express there's path property
    if (!reqPath) {
      // if pure connect (from vite), need to construct req path
      // use originalUrl instead of url because the latter is modified by Vite 5+ (not modified in Vite 4)
      const url = new URL(req.originalUrl, 'http://localhost');
      reqPath = url.pathname;
    }
    if (reqPath === '/favicon.png') {
      const readStream = fs.createReadStream(path.join(__dirname, './favicon.png'));
      res.writeHead(200, { 'Content-Type': 'image/png' });
      readStream.pipe(res);
      return;
    }
    if (serviceWorker && reqPath === serviceWorker) {
      // Service built-in service worker
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.write(swContent);
      res.end();
      return;
    }

    const appInfo = await museCore.utils.asyncInvokeFirst('museMiddleware.app.getAppInfo', req);
    if (appInfo) {
      appName = appInfo.appName;
      envName = appInfo.envName;
    } else if (byUrl) {
      const appInfo = await getAppInfoByUrl(req);
      logger.info(`App info by url: ${JSON.stringify(appInfo)}`);

      if (!appInfo) {
        return next();
      }
      appName = appInfo.appName;
      envName = appInfo.envName;
    } else if (!appName) {
      throw new Error(`No appName provided to start the Muse app.`);
    } else {
      logger.info(`Getting app by specified ${appName}/${envName}`);
    }

    logger.info(`Getting full app data: ${appName}`);
    const app = await museCore.data.get(`muse.app.${appName}`);
    if (!app) {
      res.end('Muse app not found: ' + appName);
      return;
    }
    cdn = app.cdn || cdn;
    const env = app.envs?.[envName];
    if (!env) {
      res.end('No env found: ' + envName);
      return;
    }
    // Have the opportunity to modify app, env and plugins
    await museCore.utils.asyncInvoke('museMiddleware.app.processAppInfo', { app, env });

    const plugins = env.plugins;
    const bootPlugins = plugins.filter((p) => p.type === 'boot');

    if (bootPlugins.length === 0) {
      return res.end('No boot plugin.');
    } else if (bootPlugins.length > 1) {
      return res.end(
        `There should be only one boot plugin, found ${bootPlugins.length}: ${bootPlugins.map(
          (p) => p.name,
        )}`,
      );
    }

    const bootPlugin = bootPlugins[0];

    const appConfig = _.omit(app, ['envs']);
    if (appName && variables[appName]) {
      if (!appConfig.variables) appConfig.variables = {};
      Object.assign(appConfig.variables, variables[appName]);
    }
    if (appName && pluginVariables[appName]) {
      if (!appConfig.pluginVariables) appConfig.pluginVariables = {};
      Object.assign(appConfig.pluginVariables, pluginVariables[appName]);
    }

    const museGlobal = {
      app: appConfig,
      env: _.omit(env, ['plugins']),
      appName: appName,
      envName: envName,
      appVariables: populateAppVariables(appConfig, env),
      pluginVariables: populatePluginVariables(appConfig, env),
      plugins,
      isDev,
      isLocal,
      isE2eTest: req.headers['user-agent']?.includes('MuseE2eTest'),
      cdn,
      bootPlugin: bootPlugin.name,
      // If app disabled service worker, or it's not confiugred for the app
      serviceWorker:
        !app.noServiceWorker && serviceWorker
          ? path.join(req.baseUrl || '/', serviceWorker)
          : false,
    };

    museCore.plugin.invoke('museMiddleware.app.processMuseGlobal', museGlobal);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const favicon = app.iconId
      ? `${cdn}/p/app-icon.${app.name}/v0.0.${app.iconId}/dist/icon.png`
      : defaultFavicon || path.join(req.baseUrl || '/', 'favicon.png');
    const ctx = {
      app,
      env,
      req,
      res,
      bootPlugin,
      indexHtml: _.template(template)({
        title: app.title || 'Muse App',
        favicon,
        bootType: bootPlugin.esModule ? 'module' : '',
        bootPluginUrl:
          bootPlugin.url ||
          `${cdn}/p/${museCore.utils.getPluginId(bootPlugin.name)}/v${
            bootPlugin.version
          }/dist/boot.js`,
        museGlobal: JSON.stringify(museGlobal, null, 2),
      }),
    };
    await museCore.utils.asyncInvoke('museMiddleware.app.processIndexHtml', ctx);
    res.write(ctx.indexHtml);
    res.end();
  };
};
