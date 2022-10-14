const MuseCracoPlugin = require('@ebay/muse-craco-plugin');
const CracoLessPlugin = require('craco-less');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = () => {
  return {
    // NOTE: craco less plugin should be before muse craco plugin
    plugins: [{ plugin: CracoLessPlugin }, { plugin: MuseCracoPlugin }],
    webpack: {
      plugins: {
        add: [new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false })],
      },
    },
  };
};
