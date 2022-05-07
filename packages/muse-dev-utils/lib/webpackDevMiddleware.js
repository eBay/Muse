/**
The dev time service for Muse.
  1. Get Muse data from Muse registry: app config, plugin list, etc
  2. Cache static resources
 */
const { pkgJson, museConfig } = require('./museContext');
const getDevApp = require('./getDevApp');

module.exports = async (req, res, next) => {
  if (!req.path.startsWith('/_muse_api')) {
    return next();
  }
  switch (req.path) {
    case '/_muse_api/muse-data/muse.app': {
      res.set('Content-Type', 'application/json');
      const devApp = await getDevApp();
      res.send(devApp);
      break;
    }
    default:
      throw new Error('Unknown _muse_api endpoint: ' + req.path);
  }
  // res.send('hello' + pkgJson.name + ', ' + req.path);
};
