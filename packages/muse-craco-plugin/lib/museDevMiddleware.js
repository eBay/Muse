/**
The dev time service for Muse.
  1. Get Muse data from Muse registry: app config, plugin list, etc
  2. Cache static resources
 */
const { pkgJson } = require('./museContext');
module.exports = (req, res) => {
  res.send('hello' + pkgJson.name + ', ' + req.originalUrl);
};
