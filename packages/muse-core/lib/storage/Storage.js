const EventEmitter = require('events');
const _ = require('lodash');
const plugin = require('js-plugin');

async function asyncInvoke(extPoint, ...args) {
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

function getExtPoint(extPath, name) {
  return extPath ? extPath + '.' + name : name;
}

async function wrappedAsyncInvoke(extPath, methodName, ...args) {
  const cMethodName = _.capitalize(methodName);
  const ctx = {};
  await asyncInvoke(getExtPoint(extPath, 'before' + cMethodName), ctx, ...args);
  try {
    ctx.result = await asyncInvokeFirst(getExtPoint(extPath, methodName), ...args);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke(getExtPoint(extPath, 'faild' + cMethodName), ctx, ...args);
    throw err;
  }

  await asyncInvoke(getExtPoint(extPath, 'after' + cMethodName), ctx, ...args);
  return ctx.result;
}

class Storage extends EventEmitter {
  /**
   *
   * @param {*} options providers
   */
  constructor(options) {
    super();
    this.options = options;
    this.extPath = options.extPath || '';
    plugin.invoke(getExtPoint(this.extPath, 'init'), this);
  }
  async get(path) {
    await wrappedAsyncInvoke(this.extPath, 'get', path);
  }
  async set(path, value, msg) {
    await wrappedAsyncInvoke(this.extPath, 'set', path, value, msg);
  }
  async del(path, msg) {
    await wrappedAsyncInvoke(this.extPath, 'del', path, msg);
  }
  async count(path) {
    await wrappedAsyncInvoke(this.extPath, 'count', path);
  }
  async exists(path) {
    await wrappedAsyncInvoke(this.extPath, 'exists', path);
  }
  async list(path) {
    await wrappedAsyncInvoke(this.extPath, 'list', path);
  }
  async readStream(path) {
    await wrappedAsyncInvoke(this.extPath, 'getStream', path);
  }

  async writeStream(path, value, msg) {
    await wrappedAsyncInvoke(this.extPath, 'writeStream', path, value, msg);
  }
}

module.exports = Storage;
