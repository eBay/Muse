const CracoLessPlugin = require('craco-less');
const MuseCracoPlugin = require('@ebay/muse-craco-plugin');
const MuseEbayCracoPlugin = require('@ebay/muse-ebay-craco-plugin');
const esmModules = ['react-syntax-highlighter', '.*nice-form-react'];
const path = require('path');

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
        setupFilesAfterEnv: [path.resolve(__dirname, './tests/setupAfterEnv.js')],
        testMatch: [path.resolve(__dirname, './tests/**/*.test.js')],
        roots: [path.resolve(__dirname,'./tests/')],
        clearMocks: true,
        moduleNameMapper: {
          '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            path.resolve(__dirname, './tests/__mocks__/fileMock.js'),
          '\\.(css|less)$': path.resolve(__dirname, './tests/__mocks__/styleMock.js'),
        },
        transformIgnorePatterns: [`node_modules/(?!(?:.pnpm/)?(${esmModules.join('|')}))`],
      },
    },
  };
};
