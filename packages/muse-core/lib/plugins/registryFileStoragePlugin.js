const FileStorage = require('../storage/FileStorage');
const { defaultRegistryStorageLocation } = require('../utils');

module.exports = (options = {}) => {
  return {
    name: 'default-registry-file-storage',
    museCore: {
      registry: {
        storage: new FileStorage({ location: options.location || defaultRegistryStorageLocation }),
      },
    },
  };
};
