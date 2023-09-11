const path = require('path');
const pkgJson = require(path.join(process.cwd(), './package.json'));
const isDevBuildScript =
  process.env.npm_lifecycle_script.includes('NODE_ENV=development') &&
  process.env.npm_lifecycle_script.includes('craco build');

module.exports = {
  isTestBuild: !!process.env.MUSE_TEST_BUILD,
  isDevBuild: isDevBuildScript,
  isDev: process.env.NODE_ENV === 'development' && !isDevBuildScript,
  isProdBuild: process.env.NODE_ENV === 'production',
  pkgJson,
  museConfig: pkgJson.muse || {},
};
