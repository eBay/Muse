// Config env variables for react-scripts
process.env.BROWSER = 'none';
const { isDevBuild } = require('./museContext');
if (isDevBuild) {
  process.env.BUILD_PATH = './build/dev';
} else {
  process.env.BUILD_PATH = './build/dist';
}

module.exports = {
  overrideCracoConfig: require('./overrideCracoConfig'),
  overrideWebpackConfig: require('./overrideWebpackConfig'),
  overrideDevServerConfig: require('./overrideDevServerConfig'),
};
