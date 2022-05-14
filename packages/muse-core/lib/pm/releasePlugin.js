// Release a plugin:
// core feature:
//   upload the plugin bundle to cdn
// other:
// ...
const fs = require('fs-extra');
const globby = require('globby');
const plugin = require('plugin');
const { asyncInvoke } = require('../utils');
const staticStorage = require('../storage').static;

module.exports = async (params) => {
  //
  const { pluginName, buildDir, version } = params;
  const dirName = pluginName;

  await asyncInvoke('museCore.pm.releasePlugin', params);

  plugin.invoke('museCore.pm.releasePlugin', params);
};
