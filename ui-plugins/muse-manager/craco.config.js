const CracoLessPlugin = require('craco-less');
const MuseCracoPlugin = require('@ebay/muse-craco-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = () => {
  return {
    plugins: [{ plugin: CracoLessPlugin }, { plugin: MuseCracoPlugin }],
    webpack: {
      plugins: {
        add: [new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false })],
      },
    },
  };
};
