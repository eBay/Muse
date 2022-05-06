const path = require('path');
const pkgJson = require(path.join(process.cwd(), './package.json'));

module.exports = {
  isDevBuild: !!process.env.MUSE_DEV_BUILD,
  pkgJson,
  museConfig: pkgJson.muse || {},
};
