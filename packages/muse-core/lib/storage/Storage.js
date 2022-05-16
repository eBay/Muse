const EventEmitter = require('events');
const _ = require('lodash');
const plugin = require('js-plugin');
const fs = require('fs-extra');
const path = require('path');
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

  // a helper method to upload a local folder to the storage
  async uploadDir(path, dir, msg) {
    const ctx = {};
    await asyncInvoke(getExtPoint(this.extPath, 'beforeUploadDir'), ctx, path, dir, msg);
    const files = await getFilesRecursively(dir);
    ctx.files = files;
    await batchAsync(
      files.map((f) => async () => {
        const buff = await fs.readFile(f);
        await makeRetryAble(async (...args) => this.set(...args))(path + f.replace(dir, ''), buff);
      }),
      100,
      `Batch upload files from ${dir}`,
    );
    await asyncInvoke(getExtPoint(this.extPath, 'afterUploadDir'), ctx, path, dir, msg);
  }
}

module.exports = Storage;
