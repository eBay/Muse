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
              return assetsStorage.get(key, null, true); // force get the stroage data
            },
            ...options,
          }),
        },
      },
    },
  };
};
