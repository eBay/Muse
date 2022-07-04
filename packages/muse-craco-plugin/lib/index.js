// Config env variables for react-scripts
process.env.BROWSER = 'none';
const { isDevBuild } = require('@ebay/muse-dev-utils').museContext;
if (isDevBuild) {
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
