// Release a plugin:
// core feature:
//   Create a release item in <registry-storage>/plugins/releases/<plugin-name>.yaml
// other:
// ...
const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const { asyncInvoke, jsonByBuff, getPluginId } = require('../utils');
const { registry } = require('../storage');
const registerRelease = require('./registerRelease');

module.exports = async (params) => {
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeReleasePlugin', ctx, params);
  await registerRelease(params);

  // await

  await asyncInvoke('museCore.pm.releasePlugin', ctx, params);

  await asyncInvoke('museCore.pm.afterReleasePlugin', ctx, params);
};
