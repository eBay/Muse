const path = require('path');
module.paths.splice(0, 2, path.join(process.cwd(), 'node_modules'));
require('@ebay/muse-modules').config.matchVersion = 'major';
module.exports = {
  MusePlugin: require('./MusePlugin'),
  MuseReferencePlugin: require('./MuseReferencePlugin'),
};
