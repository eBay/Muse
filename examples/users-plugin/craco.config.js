const MuseCracoPlugin = require('@ebay/muse-craco-plugin');
const CracoLessPlugin = require('craco-less');

module.exports = () => {
  return {
    // NOTE: craco less plugin should be before muse craco plugin
    plugins: [{ plugin: CracoLessPlugin }, { plugin: MuseCracoPlugin }],
  };
};
