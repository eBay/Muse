const CracoLessPlugin = require('craco-less');
const MuseCracoPlugin = require('@ebay/muse-craco-plugin');
const MuseEbayCracoPlugin = require('@ebay/muse-ebay-craco-plugin');

module.exports = () => {
  return {
    plugins: [
      { plugin: CracoLessPlugin },
      { plugin: MuseCracoPlugin },
      { plugin: MuseEbayCracoPlugin },
    ],
    jest: {
      configure: {
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
