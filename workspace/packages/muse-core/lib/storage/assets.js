/**
 * assets storage instance
 * */
const Storage = require('./Storage');

const assets = new Storage({
  extPath: 'museCore.assets.storage',
});

module.exports = assets;
