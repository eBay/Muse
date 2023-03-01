const MuseCracoPlugin = require('@ebay/muse-craco-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = () => {
  return {
    plugins: [{ plugin: MuseCracoPlugin }],
    jest: {
      configure: {
        // override default jest configuration provided by @ebay/muse-craco-plugin
      },
    },
    webpack: {
      plugins: {
        add: [new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false })],
      },
    },
  };
};
