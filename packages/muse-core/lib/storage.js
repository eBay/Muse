const EventEmitter = require('events');
const _ = require('lodash');
const plugin = require('js-plugin');
const FileStorage = require('./FileStorage');

async function asyncInvoke(plugin, extPoint, ...args) {
  const noThrows = extPoint.endsWith('!');
  extPoint = extPoint.replace(/^!.|!.$/g, '');
  const plugins = plugin.getPlugins(extPoint);
  const res = [];
  for (const p of plugins) {
    try {
      const value = await _.invoke(p, extPoint, ...args);
      res.push(value);
    } catch (err) {
      if (!noThrows) throw err;
      res.push(err);
    }
  }
  return res;
}

async function asyncInvokeFirst(extPoint, ...args) {
  const noThrows = extPoint.endsWith('!');
  extPoint = extPoint.replace(/^!.|!.$/g, '');
  const p = plugin.getPlugins(extPoint)[0];
  if (!p) return;
  try {
    return await _.invoke(p, extPoint, ...args);
  } catch (err) {
    if (!noThrows) throw err;
  }
  return undefined;
}

async function wrappedInvoke(extPath, methodName, ...args) {
  const cMethodName = _.capitalize(methodName);
  const ctx = {};
  await asyncInvoke(extPath + '.before' + cMethodName, ctx, ...args);
  try {
    ctx.result = await asyncInvokeFirst(extPath + '.' + methodName, ...args);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke(extPath + '.faild' + cMethodName, ctx, ...args);
    throw err;
  }

  await asyncInvoke(extPath + '.after' + cMethodName, ctx, ...args);
  return ctx.result;
}

// function getPlugins(storageConfig) {
//   const plugins = [];
//   storageConfig.plugins.forEach((p) => {
//     if (p.provider === 'file') {
//       plugins.push(new FileStorage(p.options));
//     } else {
//       const Provider = require(p.provider);
//       plugins.push(new Provider(p.options));
//     }
//   });
//   return plugins;
// }

class Storage extends EventEmitter {
  /**
   *
   * @param {*} options providers
   */
  constructor(options) {
    super();
    this.options = options;
    this.extPath = options.extPath || '';
    // getPlugins(options).forEach((p) => {
    //   this.plugin.register(p);
    // });
    plugin.invoke('init', this);
  }
  async get(path) {
    this.plugin.invoke('beforeGet', path);
    let result;
    try {
      result = this.plugin.invoke('get', path);
    } catch (err) {
      this.plugin('failedGet', path, err);
      throw err;
    }
    const obj = { value: result };
    this.plugin.invoke('afterGet', path, obj);
    return obj.value;
  }
  async set(path, value, msg) {
    const obj = { value };
    this.plugin.invoke('beforeSet', path, obj, msg);
    try {
      this.plugin.invoke('set', path, obj.value, msg);
    } catch (err) {
      this.plugin.invoke('failedSet', path, obj.value, msg, err);
      throw err;
    }
    this.plugin.invoke('afterSet', path, obj.value, msg);
  }
  async del(path, msg) {
    await wrappedInvoke(this.options.prefix, 'del', path, msg);
  }
  async count(path) {}
  async exists(path) {}
  async list(path) {}
  async getStream(path) {}

  // return a zip stream for a container
  // async archive(path) {}
  // onChange() {}
  //   plugin.invoke('del', path);
  // },
  // list: async (path) => {
  //   plugin.invoke('list', path);
  // },
  // upload: async (dirPath) => {
  //   plugin.invoke('upload', dirPath);
  // },
}

module.exports = Storage;
