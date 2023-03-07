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
    jest: {
      configure: {
        // override default jest configuration provided by @ebay/muse-craco-plugin
        setupFiles: ['<rootDir>/tests/setup.js'],
        testMatch: ['<rootDir>/tests/**/*.test.js'],
        roots: ['<rootDir>/tests/'],
      },
    },
    babel: {
      presets: ['@babel/preset-react'],
    },
  };
};
