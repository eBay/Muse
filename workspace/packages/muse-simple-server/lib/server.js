const express = require('express');
const plugin = require('js-plugin');
const path = require('path');
const museAssetsMiddleware = require('@ebay/muse-express-middleware/lib/assets');
const museApiMiddleware = require('@ebay/muse-express-middleware/lib/api');
const museAppMiddleware = require('@ebay/muse-express-middleware/lib/app');

async function server({ appName, envName = 'staging', isDev, port = 6070 }) {
  const app = express();
  // TODO: This auth middleware is only for testing, need to be removed
  app.use(
    require('@ebay/muse-auth-middleware')({
      allowedApps: ['musemanager'],
    }),
  );
  plugin.invoke('museServer.preProcessApp', app);
  app.use(express.json());
  app.get('/*', express.static(path.join(__dirname, '../static')));
  plugin.invoke('museServer.processApp', app);
  app.use(museApiMiddleware({}));
  app.use(museAssetsMiddleware({}));
  app.use(museAppMiddleware({ appName, envName, isDev, isLocal: true, byUrl: !appName }));
  plugin.invoke('museServer.postProcessApp', app);

  app.listen(port, () => {
    console.log(
      `Simple Muse server for ${
        appName ? appName + '/' + envName : 'by-url'
      } listening on port ${port}`,
    );
    console.log(`* Note this is a simple server for local dev and testing, not for production.`);
  });
}

module.exports = server;
