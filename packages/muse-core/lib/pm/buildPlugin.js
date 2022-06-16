const plugin = require('js-plugin');
/**
 * @module muse-core/pm/buildPlugin
 */
/**
 * Create a release a plugin
 * @param  {...any} args args to build plugn
 * @example
 * buildPlugin({ pluginId: 'muse-react' });
 */
module.exports = (...args) => {
  plugin.invoke('museUtils.pm.buildPlugin', ...args);
};
