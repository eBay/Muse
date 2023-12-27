const CracoLessPlugin = require('craco-less');
const MuseCracoPlugin = require('@ebay/muse-craco-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = () => {
  return {
    plugins: [
      { plugin: CracoLessPlugin },
      {
        plugin: MuseCracoPlugin,
        options: { skipMuseJestMocks: false },
      },
    ],
    babel: {
      presets: [['@babel/preset-react']],
    },
    webpack: {
      plugins: {
        add: [new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false })],
      },
    },
  };
};
