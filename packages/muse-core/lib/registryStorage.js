// registry storage
const path = require('path');
const os = require('os');
const plugin = require('js-plugin');

const config = require('./config');
const Storage = require('./Storage');
const FileStorage = require('./FileStorage');

if (config?.registry?.storage?.type === 'file') {
  const options = Object.assign(
    {
      location: path.join(os.homedir(), 'muse-storage/registry'),
    },
    config?.registry?.storage?.options,
  );
  plugin.register({
    name: 'default-registry-file-storage',
    registry: {
      storage: new FileStorage(options),
    },
  });
}
const registryStorage = new Storage({
  extPath: 'muse.registry.storage',
});

module.exports = registryStorage;
