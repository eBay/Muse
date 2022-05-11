const JsPlugin = require('js-plugin');

const plugin = JsPlugin.createInstance();

module.exports = {
  init: async () => {},
  register: (provider) => {
    plugin.register(provider);
  },
  get: async (path) => {
    plugin.invoke('get', path);
  },
  del: async (path, msg) => {
    plugin.invoke('del', path);
  },
  set: async (path, value, msg) => {
    plugin.invoke('set', path);
  },
  list: async (path) => {
    plugin.invoke('list', path);
  },
};
