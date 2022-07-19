const path = require('path');
const os = require('os');
const { FileStorage } = require('../storage');
module.exports = () => {
  return {
    name: 'default-data-cache-plugin',
    museCore: {
      data: {
        cache: new FileStorage({ location: path.join(os.homedir(), 'muse-storage/.data-cache') }),
      },
    },
  };
};
