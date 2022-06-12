const FileStorage = require('../storage/FileStorage');
const { defaultAssetStorageLocation } = require('../utils');

module.exports = (options = {}) => {
  return {
    name: 'default-assets-file-storage',
    museCore: {
      assets: {
        storage: new FileStorage({ location: options.location || defaultAssetStorageLocation }),
      },
    },
  };
};
