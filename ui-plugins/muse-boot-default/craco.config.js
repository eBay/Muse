const MuseCracoPlugin = require('@ebay/muse-craco-plugin');

module.exports = () => {
  return {
    plugins: [{ plugin: MuseCracoPlugin }],
    jest: {
      configure: {
        // override default jest configuration provided by @ebay/muse-craco-plugin
      },
    },
  };
};
