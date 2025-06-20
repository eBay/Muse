const MuseCracoPlugin = require('@ebay/muse-craco-plugin');

module.exports = () => {
  return {
    plugins: [{ plugin: MuseCracoPlugin }],
  };
};
