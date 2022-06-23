const CracoLessPlugin = require('craco-less');
const MuseCracoPlugin = require('muse-craco-plugin');

module.exports = () => {
  return {
    plugins: [{ plugin: CracoLessPlugin }, { plugin: MuseCracoPlugin }],
  };
};
