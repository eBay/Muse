const EventEmitter = require('events');
const plugin = require('js-plugin');
const fs = require('fs-extra');
const {
  batchAsync,
  makeRetryAble,
  asyncInvoke,
  getExtPoint,
  getFilesRecursively,
  wrappedAsyncInvoke,
} = require('../utils');

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
    return await wrappedAsyncInvoke(this.extPath, 'get', path);
  }
  async set(path, value, msg) {
    await wrappedAsyncInvoke(this.extPath, 'set', path, value, msg);
  }
  async del(path, msg) {
    await wrappedAsyncInvoke(this.extPath, 'del', path, msg);
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
    ctx.items = (await this.list(keyPath)).filter((item) => item.type === 'file');

    await batchAsync(
      ctx.items.map((item) => async () => {
        item.content = await makeRetryAble(async (...args) => this.get(...args))(keyPath + '/' + item.name);
      }),
      100, // TODO: make it configurable
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
      files.map((f) => async () => {
        const buff = await fs.readFile(f);
        await makeRetryAble(async (...args) => this.set(...args))(toPath + f.replace(fromDir, ''), buff);
      }),
      100, // TODO: make it configurable
      `Batch upload files from ${fromDir}`,
    );
    await asyncInvoke(getExtPoint(this.extPath, 'afterUploadDir'), ctx, toPath, fromDir, msg);
  }
}

module.exports = Storage;
