// Config env variables for react-scripts
const fs = require('fs');
const path = require('path');
process.env.BROWSER = 'none';

const { isDevBuild, isTestBuild } = require('@ebay/muse-dev-utils').museContext;
if (isDevBuild) {
  process.env.BUILD_PATH = './build/dev';
} else if (isTestBuild) {
  process.env.BUILD_PATH = './build/test';
} else {
  process.env.BUILD_PATH = './build/dist';
}

const certFilePath = path.join(process.cwd(), './node_modules/.muse/certs/muse-dev-cert.crt');
const certKeyFilePath = path.join(process.cwd(), './node_modules/.muse/certs/muse-dev-cert.key');

if (
  fs.existsSync(certFilePath) &&
  fs.existsSync(certKeyFilePath) &&
  !process.env.SSL_CRT_FILE &&
  !process.env.SSL_KEY_FILE
) {
  process.env.SSL_CRT_FILE = certFilePath;
  process.env.SSL_KEY_FILE = certKeyFilePath;
}

module.exports = {
  overrideCracoConfig: require('./overrideCracoConfig'),
  overrideWebpackConfig: require('./overrideWebpackConfig'),
  overrideDevServerConfig: require('./overrideDevServerConfig'),
  overrideJestConfig: require('./overrideJestConfig'),
};
