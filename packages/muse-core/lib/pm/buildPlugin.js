const plugin = require('js-plugin');
/**
 * Create a release a plugin
 * @param  {...any} args { pluginId = 'muse-react' }
 */
module.exports = (...args) => {
  plugin.invoke('museUtils.pm.buildPlugin', ...args);
};
