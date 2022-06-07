// assets storage instance
// Whenever a new release is created, the plugin's bundle will be uploaded to the assets storage.
// It uses the first assets storage provider if exists
// Otherwise uses the local folder <home-dir>/muse-storage/assets

const plugin = require('js-plugin');
const config = require('../config');
const Storage = require('./Storage');
const FileStorage = require('./FileStorage');
const { defaultAssetStorageLocation } = require('../utils');

const assetsStorageProviders = plugin.getPlugins('museCore.assets.storage.get').filter(Boolean);
if (assetsStorageProviders.length > 1) {
  console.log(
    `[WARNING]: multiple registry stroage providers found: ${assetsStorageProviders
      .map((p) => p.name)
      .join(', ')}. Only the first one is used: ${assetsStorageProviders[0].name}.`,
  );
}
if (assetsStorageProviders.length === 0) {
  plugin.register({
    name: 'default-assets-file-storage',
    museCore: {
      assets: {
        storage: new FileStorage(
          config.get('defaultAssetsStorageOptions') || { location: defaultAssetStorageLocation },
        ),
      },
    },
  });
}

const assets = new Storage({
  extPath: 'museCore.assets.storage',
});

module.exports = assets;
