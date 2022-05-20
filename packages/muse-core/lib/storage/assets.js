// plugin assets storage
const path = require('path');
const os = require('os');
const plugin = require('js-plugin');
const config = require('../config');
const Storage = require('./Storage');
const FileStorage = require('./FileStorage');
const { defaultAssetStorage } = require('../utils');

// By default, use the file storage

if (
  // config?.assets?.storage?.type === 'file' ||
  plugin.getPlugins('museCore.assets.storage.get').filter(Boolean).length === 0
) {
  const options = Object.assign(
    {
      location: defaultAssetStorage,
    },
    config?.assets?.storage?.options,
  );
  plugin.register({
    name: 'default-assets-file-storage',
    museCore: {
      assets: {
        storage: new FileStorage(options),
      },
    },
  });
}

const assets = new Storage({
  extPath: 'museCore.assets.storage',
});

module.exports = assets;
