// Config env variables for react-scripts
process.env.BROWSER = 'none';
const { isDev, isTestBuild } = require('@ebay/muse-dev-utils').museContext;
if (isTestBuild) {
  process.env.BUILD_PATH = './build/test';
} else if (isDev) {
  process.env.BUILD_PATH = './build/dev';
} else {
  process.env.BUILD_PATH = './build/dist';
}
module.exports = {
  overrideCracoConfig: require('./overrideCracoConfig'),
  overrideWebpackConfig: require('./overrideWebpackConfig'),
  overrideDevServerConfig: require('./overrideDevServerConfig'),
  overrideJestConfig: require('./overrideJestConfig'),
};
