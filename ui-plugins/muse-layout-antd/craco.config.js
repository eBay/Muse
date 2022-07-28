const CracoLessPlugin = require('craco-less');
const MuseCracoPlugin = require('@ebay/muse-craco-plugin');

module.exports = () => {
  return {
    plugins: [
      { plugin: CracoLessPlugin },
      {
        plugin: MuseCracoPlugin,
        options: { showJestConfig: false, skipMuseJestMocks: false },
      },
    ],
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
