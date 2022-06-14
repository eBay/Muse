const path = require('path');
const os = require('os');
const { MuseLruCache } = require('../cache');
const assetsStorage = require('../storage/assets');

module.exports = (options = {}) => {
  return {
    name: 'default-assets-storage-cache',
    museCore: {
      assets: {
        storage: {
          cache: new MuseLruCache({
            getData: async (key) => {
              return await assetsStorage.get(key, null, true); // force get the stroage data
            },
            diskLocation: path.join(os.homedir(), 'muse-storage/.assets-cache'),

            ...options,
          }),
        },
      },
    },
  };
};
