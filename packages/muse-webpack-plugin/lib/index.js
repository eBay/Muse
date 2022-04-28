const path = require('path');
module.paths.splice(0, 2, path.join(process.cwd(), 'node_modules'));
module.exports = {
  MusePlugin: require('./MusePlugin'),
  MuseReferencePlugin: require('./MuseReferencePlugin'),
};
