// static storage
const path = require('path');
const os = require('os');
const plugin = require('js-plugin');

const config = require('./config');
const Storage = require('./Storage');
const FileStorage = require('./FileStorage');

if (config?.static?.storage?.type === 'file') {
  const options = Object.assign(
    {
      location: path.join(os.homedir(), 'muse-storage/static'),
    },
    config?.static?.storage?.options,
  );
  plugin.register({
    name: 'default-static-file-storage',
    static: {
      storage: new FileStorage(options),
    },
  });
}
const staticStorage = new Storage({
  extPath: 'muse.static.storage',
});

module.exports = staticStorage;
