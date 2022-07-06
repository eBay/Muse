const CracoLessPlugin = require('craco-less');
const MuseCracoPlugin = require('@ebay/muse-craco-plugin');

module.exports = () => {
  return {
    plugins: [
      { plugin: CracoLessPlugin },
      { plugin: MuseCracoPlugin, options: { showJestConfig: true } },
    ],
    jest: {
      configure: {
        // override default jest configuration provided by @ebay/muse-craco-plugin
        setupFiles: ['<rootDir>/tests/setup.js'],
        testMatch: ['<rootDir>/tests/**/*.test.js'],
        roots: ['<rootDir>/tests/'],
      },
    },
  };
};
