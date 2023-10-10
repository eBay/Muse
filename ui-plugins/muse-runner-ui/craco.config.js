const CracoLessPlugin = require('craco-less');
const MuseCracoPlugin = require('@ebay/muse-craco-plugin');
const MuseEbayCracoPlugin = require('@ebay/muse-ebay-craco-plugin');

module.exports = () => {
  return {
    plugins: [
      { plugin: CracoLessPlugin },
      {
        plugin: MuseCracoPlugin,
        options: { skipMuseJestMocks: false },
      },
      {
        plugin: MuseEbayCracoPlugin,
        options: { nodePolyfills: true },
      },
    ],
    babel: {
      presets: [['@babel/preset-react']],
    },
  };
};
