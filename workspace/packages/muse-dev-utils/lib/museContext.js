const path = require('path');
const pkgJson = require(path.join(process.cwd(), './package.json'));

module.exports = {
  isTestBuild: !!process.env.MUSE_TEST_BUILD,
  isDev: process.env.NODE_ENV === 'development',
  isProdBuild: process.env.NODE_ENV === 'production',
  pkgJson,
  museConfig: pkgJson.muse || {},
};
