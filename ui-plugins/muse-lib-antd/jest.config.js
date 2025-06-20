const esmModules = ['react-syntax-highlighter', '.*nice-form-react', '.*muse-lib-react'];
const path = require('path');

module.exports = {
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
    '@ebay/nice-form-react/adaptors/antdAdaptor': '@ebay/nice-form-react/src/adaptors/antdAdaptor'
  },
  transformIgnorePatterns: [`node_modules/(?!(?:.pnpm/)?(${esmModules.join('|')}))`],
};