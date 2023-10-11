const CracoLessPlugin = require('craco-less');
const MuseCracoPlugin = require('@ebay/muse-craco-plugin');
const MuseEbayCracoPlugin = require('@ebay/muse-ebay-craco-plugin');
const esmModules = ['react-syntax-highlighter'];

module.exports = () => {
  return {
    plugins: [
      { plugin: CracoLessPlugin },
      { plugin: MuseCracoPlugin },
      { plugin: MuseEbayCracoPlugin },
    ],
    jest: {
      configure: {
        // override default jest configuration provided by @ebay/muse-craco-plugin
        testEnvironment: 'jsdom',
        setupFiles: ['jest-canvas-mock'],
        setupFilesAfterEnv: ['<rootDir>/tests/setupAfterEnv.js'],
        testMatch: ['<rootDir>/tests/**/*.test.js'],
        roots: ['<rootDir>/tests/'],
        clearMocks: true,
        moduleNameMapper: {
          '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/tests/__mocks__/fileMock.js',
          '\\.(css|less)$': '<rootDir>/tests/__mocks__/styleMock.js)',
        },
        transformIgnorePatterns: [`node_modules/(?!(?:.pnpm/)?(${esmModules.join('|')}))`],
      },
    },
    babel: {
      presets: ['react-app'],
      plugins: [['@babel/plugin-transform-react-jsx'],['@babel/plugin-syntax-dynamic-import']],
    },
  };
};
