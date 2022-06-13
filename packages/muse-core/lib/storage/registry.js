// registry storage instance
// It uses the first registry storage provider if exists
// Otherwise uses the local folder <home-dir>/muse-storage/registry

const plugin = require('js-plugin');
const config = require('../config');
const Storage = require('./Storage');
const FileStorage = require('./FileStorage');
const { defaultRegistryStorageLocation } = require('../utils');

// By default, use the file storage

const registryStorageProviders = plugin.getPlugins('museCore.registry.storage.get').filter(Boolean);
console.log('registryStorageProviders: ', registryStorageProviders);
if (registryStorageProviders.length > 1) {
  console.log(
    `[WARNING]: multiple registry stroage providers found: ${registryStorageProviders
      .map((p) => p.name)
      .join(', ')}. Only the first one is used: ${registryStorageProviders[0].name}.`,
  );
}
// If no providers found, use the default file storage.
if (registryStorageProviders.length === 0) {
  plugin.register({
    name: 'default-registry-file-storage',
    museCore: {
      registry: {
        storage: new FileStorage(
          config.get('defaultRegistryStorageOptions') || { location: defaultRegistryStorageLocation },
        ),
      },
    },
  });
}
const registryStorage = new Storage({
  extPath: 'museCore.registry.storage',
});

module.exports = registryStorage;
