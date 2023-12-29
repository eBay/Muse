const CracoLessPlugin = require('craco-less');
const MuseCracoPlugin = require('@ebay/muse-craco-plugin');

module.exports = () => {
  return {
    plugins: [{ plugin: CracoLessPlugin }, { plugin: MuseCracoPlugin }],
  };
};
