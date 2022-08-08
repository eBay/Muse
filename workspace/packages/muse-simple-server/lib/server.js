const express = require('express');
const plugin = require('js-plugin');
const path = require('path');
const museAssetsMiddleware = require('@ebay/muse-express-middleware/lib/assets');
const museApiMiddleware = require('@ebay/muse-express-middleware/lib/api');
const museAppMiddleware = require('@ebay/muse-express-middleware/lib/app');

async function server({ appName, envName = 'staging', isDev, port = 6070 }) {
  const app = express();
  app.use(
    require('@ebay/muse-auth-middleware')({
      allowedApps: ['musemanager'],
    }),
  );
  app.use(express.json());
  app.get('/*', express.static(path.join(__dirname, '../static')));
  plugin.invoke('museServer.processApp', app);
  app.use(museApiMiddleware({}));
  app.use(museAssetsMiddleware({}));
  app.use(museAppMiddleware({ appName, envName, isDev, isLocal: true, byUrl: !appName }));

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
