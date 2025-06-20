const path = require('path');
const pkgJson = require(path.join(process.cwd(), './package.json'));

module.exports = {
  isTestBuild: !!process.env.MUSE_TEST_BUILD,
  isDevBuild: !!process.env.MUSE_DEV_BUILD,
  isDev: process.env.NODE_ENV === 'development' && !process.env.MUSE_DEV_BUILD,
  isProdBuild: process.env.NODE_ENV === 'production',
  pkgJson,
  museConfig: pkgJson.muse || {},
};
