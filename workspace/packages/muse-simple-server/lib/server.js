const express = require('express');
const plugin = require('js-plugin');
const path = require('path');
const cors = require('cors');
const museAssetsMiddleware = require('@ebay/muse-express-middleware/lib/assets');
const museApiMiddleware = require('@ebay/muse-express-middleware/lib/api');
const museAppMiddleware = require('@ebay/muse-express-middleware/lib/app');

async function server(args) {
  const {
    appName,
    envName = 'staging',
    serveApi = false,
    serveStatic = false,
    isDev,
    byUrl = false,
    port = 6070,
    variables = {},
    pluginVariables = {},
  } = args;
  const app = express();
  // cors is used for easy testing
  app.use(cors());
  plugin.invoke('museSimpleServer.preProcessApp', { app, args });
  app.use(express.json());
  app.get('/*', express.static(path.join(__dirname, '../static')));
  plugin.invoke('museSimpleServer.processApp', { app, args });

  if (serveApi) app.use(museApiMiddleware({}));
  if (serveStatic) app.use(museAssetsMiddleware({}));
  if (appName || byUrl) {
    app.use(
      museAppMiddleware({
        appName,
        envName,
        isDev,
        isLocal: true,
        byUrl,
        variables,
        pluginVariables,
        ...args,
      }),
    );
  }
  plugin.invoke('museSimpleServer.postProcessApp', { app, args });

  app.listen(port, () => {
    console.log('Muse simple server started:');
    if (appName) console.log(`  - Serving app ${appName}@${envName} at http://localhost:${port}`);
    if (serveApi) console.log(`  - Serving Muse API service at http://localhost:${port}/api/v2`);
    if (serveStatic)
      console.log(`  - Serving Muse static assets at http://localhost:${port}/muse-assets`);
    if (byUrl) console.log(`  - Serving Muse apps by url.`);
    console.log(`* Note this is a simple server for local dev and testing, not for production.`);
  });
}

module.exports = server;
