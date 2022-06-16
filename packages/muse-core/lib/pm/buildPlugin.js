const { asyncInvoke } = require('../utils');

// This method only provides a placeholder to build a plugin project
// By default it does nothing until some plugins registered the build process to it.
// This can be used under a plugin project or used on a service to request build a plugin
// Depends on what plugins are configured.
/**
 * @module muse-core/pm/buildPlugin
 */
/**
 * Create a release a plugin
 * @param  {object} params args to build plugn
 * @example
 * buildPlugin({ pluginId: 'muse-react' });
 */
module.exports = async (params = {}) => {
  const ctx = {};
  await asyncInvoke('museCore.pm.beforeBuildPlugin', ctx, params);
  try {
    await asyncInvoke('museCore.pm.buildPlugin', ctx, params);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.pm.failedBuildPlugin', ctx, params);
    throw err;
  }
  await asyncInvoke('museCore.pm.afterBuildPlugin', ctx, params);
  return ctx;
};
