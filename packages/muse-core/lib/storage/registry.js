// registry storage instance

const Storage = require('./Storage');

const registryStorage = new Storage({
  extPath: 'museCore.registry.storage',
});

module.exports = registryStorage;
