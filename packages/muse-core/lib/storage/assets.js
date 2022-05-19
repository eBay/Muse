// plugin assets storage
const path = require('path');
const os = require('os');
const plugin = require('js-plugin');
const config = require('../config');
const Storage = require('./Storage');
const FileStorage = require('./FileStorage');

// By default, use the file storage

if (config?.assets?.storage?.type === 'file') {
  const options = Object.assign(
    {
      location: path.join(os.homedir(), 'muse-storage/assets'),
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
