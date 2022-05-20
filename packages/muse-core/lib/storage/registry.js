// registry storage
const path = require('path');
const os = require('os');
const plugin = require('js-plugin');
const config = require('../config');
const Storage = require('./Storage');
const FileStorage = require('./FileStorage');
const { defaultRegistryStorage } = require('../utils');

// By default, use the file storage

if (plugin.getPlugins('museCore.registry.storage.get').filter(Boolean).length === 0) {
  const options = Object.assign(
    {
      location: defaultRegistryStorage,
    },
    config?.registry?.storage?.options,
  );
  plugin.register({
    name: 'default-registry-file-storage',
    museCore: {
      registry: {
        storage: new FileStorage(options),
      },
    },
  });
}
const registryStorage = new Storage({
  extPath: 'museCore.registry.storage',
});

module.exports = registryStorage;
