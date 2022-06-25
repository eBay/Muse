const express = require('express');
const path = require('path');
const museAssetsMiddleware = require('muse-express-middleware/lib/assets');
const museApiMiddleware = require('muse-express-middleware/lib/api');

async function server({ appName, envName = 'staging', isDev, port = 6070 }) {
  const app = express();
  app.use((req, res, next) => {
    console.log(req.path);
    console.log(req.query);
    next();
  });
  app.use(museApiMiddleware({}));
  app.use(museAssetsMiddleware({}));
  app.get('/*', express.static(path.join(__dirname, '../static')));
  app.get('/*', require('./indexPage')(appName, envName, isDev));

  app.listen(port, () => {
    console.log(`Simple Muse server for ${appName}/${envName} listening on port ${port}`);
    console.log(`* Note this is a simple server for local dev and testing, not for production.`);
  });
}

module.exports = server;
