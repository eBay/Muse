const EventEmitter = require('events');
const plugin = require('js-plugin');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const {
  batchAsync,
  makeRetryAble,
  asyncInvoke,
  getExtPoint,
  getFilesRecursively,
  wrappedAsyncInvoke,
  asyncInvokeFirst,
} = require('../utils');

/**
 * @class
 */
class Storage extends EventEmitter {
  /**
   *
   * @param {object} options
   * @param {string} options.extPath
   */
  constructor(options) {
    super();
    this.options = options;
    this.extPath = options.extPath || '';
    plugin.invoke(getExtPoint(this.extPath, 'init'), this);
  }

  // force is only used for cache manager
  async get(path, processor, noCache, forceRefreshCache) {
    let value;
    const cacheExtPoint = getExtPoint(this.extPath, 'cache.get');
    if (!noCache && plugin.getPlugins(cacheExtPoint).length > 0) {
      // If there's cache manager, then get it from cache manager
      value = await asyncInvokeFirst(
        getExtPoint(this.extPath, 'cache.get'),
        path,
        forceRefreshCache,
      );
    } else {
      value = await wrappedAsyncInvoke(this.extPath, 'get', path);
    }
    if (!value) return null; // value is buffer, so it is truthy for 0, false
    if (!Buffer.isBuffer(value)) {
      value = Buffer.from(value); // ensure get method returns Buffer
    }
    return processor ? processor(value) : value;
  }
  async getJson(path) {
    return await this.get(path, value => JSON.parse(value.toString()));
  }
  async getJsonByYaml(path) {
    return await this.get(path, value => yaml.load(value.toString()));
  }
  async getString(path) {
    return await this.get(path, value => value.toString());
  }
  async set(path, value, msg) {
    await wrappedAsyncInvoke(this.extPath, 'set', path, value, msg);
  }
  async setString(path, value, msg) {
    await this.set(path, Buffer.from(value), msg);
  }
  async setYaml(path, value, msg) {
    await this.set(path, Buffer.from(yaml.dump(value)), msg);
  }
  async setJson(path, value, msg) {
    await this.set(path, Buffer.from(JSON.stringify(value, null, 2)), msg);
  }
  async batchSet(items, msg) {
    await wrappedAsyncInvoke(this.extPath, 'batchSet', items, msg);
  }
  async del(path, msg) {
    await wrappedAsyncInvoke(this.extPath, 'del', path, msg);
  }
  async delDir(path, msg) {
    await wrappedAsyncInvoke(this.extPath, 'delDir', path, msg);
  }
  async count(path) {
    return await wrappedAsyncInvoke(this.extPath, 'count', path);
  }
  async exists(path) {
    return await wrappedAsyncInvoke(this.extPath, 'exists', path);
  }
  async list(path) {
    return await wrappedAsyncInvoke(this.extPath, 'list', path);
  }

  async readStream(path) {
    return await wrappedAsyncInvoke(this.extPath, 'getStream', path);
  }

  async writeStream(path, value, msg) {
    await wrappedAsyncInvoke(this.extPath, 'writeStream', path, value, msg);
  }

  async listWithContent(keyPath) {
    const ctx = {};
    await asyncInvoke(getExtPoint(this.extPath, 'beforeListWithContent'), ctx);
    ctx.items = (await this.list(keyPath)).filter(item => item.type === 'file');

    await batchAsync(
      ctx.items.map(item => async () => {
        item.content = await makeRetryAble(async (...args) => this.get(...args))(
          keyPath + '/' + item.name,
        );
      }),
      {
        size: 100, // TODO: make it configurable
        msg: `list files under ${keyPath}`,
      },
    );
    await asyncInvoke(getExtPoint(this.extPath, 'afterListWithContent'), ctx);
    return ctx.items;
  }

  // a helper method to upload a local folder to the storage
  async uploadDir(fromDir, toPath, msg) {
    const ctx = {};
    await asyncInvoke(getExtPoint(this.extPath, 'beforeUploadDir'), ctx, fromDir, toPath, msg);
    const files = await getFilesRecursively(fromDir);
    ctx.files = files;
    await batchAsync(
      files.map(f => async () => {
        const buff = await fs.readFile(f);
        await makeRetryAble(async (...args) => this.set(...args))(
          toPath + f.replace(fromDir, ''),
          buff,
        );
      }),
      {
        size: 100, // TODO: make it configurable
        msg: `Batch upload files from ${fromDir}`,
      },
    );
    await asyncInvoke(getExtPoint(this.extPath, 'afterUploadDir'), ctx, toPath, fromDir, msg);
  }
}

module.exports = Storage;
