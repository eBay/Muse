// Register a release and upload assets to the storage
// NOTE: this method usually takes long time, don't call it as rest API but from some job.

const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const { asyncInvoke, jsonByBuff, getPluginId } = require('../utils');
const { assets } = require('../storage');
const registerRelease = require('./registerRelease');

module.exports = async (params) => {
  const ctx = {};
  const { pluginName, buildDir, version, author } = params;
  const pid = getPluginId(pluginName);
  await asyncInvoke('museCore.pm.beforeReleasePlugin', ctx, params);
  await registerRelease(params);

  await assets.uploadDir(buildDir, `/p/${pid}/v${version}`, `Release plugin ${pluginName}@${version} by ${author}.`);

  await asyncInvoke('museCore.pm.releasePlugin', ctx, params);

  await asyncInvoke('museCore.pm.afterReleasePlugin', ctx, params);
};
