const JsPlugin = require('js-plugin');

const plugin = JsPlugin.createInstance();

class Storage {
  constructor(options) {}
  async init() {}
  // register: (provider) => {
  //   plugin.register(provider);
  // },
  async get(path) {
    plugin.invoke('get', path);
  }
  // del: async (path, msg) => {
  //   plugin.invoke('del', path);
  // },
  // set: async (path, value, msg) => {
  //   plugin.invoke('set', path);
  // },
  // list: async (path) => {
  //   plugin.invoke('list', path);
  // },
  // upload: async (dirPath) => {
  //   plugin.invoke('upload', dirPath);
  // },
}
