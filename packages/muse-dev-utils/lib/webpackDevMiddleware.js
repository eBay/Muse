/**
The dev time service for Muse.
  1. Get Muse data from Muse registry: app config, plugin list, etc
  2. Cache static resources
 */
const proxy = require('express-http-proxy');
const getDevMuseGlobal = require('./getDevMuseGlobal');

module.exports = async (req, res, next) => {
  if (req.path.startsWith('/_muse_static/p')) {
    // proxy to cdn server
    proxy('http://localhost:6070', {
      proxyReqPathResolver: function (req) {
        return req.path.replace('/_muse_static', '');
      },
    })(req, res, next);
    return;
  }

  if (!req.path.startsWith('/_muse_api')) {
    return next();
  }
  switch (req.path) {
    case '/_muse_api/muse-data/muse.app': {
      res.set('Content-Type', 'application/json');
      const devApp = await getDevMuseGlobal();
      res.send(devApp);
      break;
    }
    case '/_muse_static': {
      proxy('http://localhost:6070')(req, res, next);
      break;
    }
    default:
      throw new Error('Unknown _muse_api endpoint: ' + req.path);
  }
  // res.send('hello' + pkgJson.name + ', ' + req.path);
};
