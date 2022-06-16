const path = require('path');
const fs = require('fs-extra');

class FileStorage {
  constructor(options) {
    if (!options?.location) throw new Error('No location specified for FileStorage.');
    this.location = options.location;
  }

  init(s) {
    // TODO: watch files change and emit to the parent
  }

  mapPath(p) {
    const absPath = path.join(this.location, p);
    if (!absPath.startsWith(this.location)) {
      throw new Error('Can not access path out of ' + this.location);
    }
    return absPath;
  }

  // value: Buffer
  /**
   *
   * @param {*} keyPath
   * @param {Buffer|String} value
   */
  async set(keyPath, value) {
    const absPath = this.mapPath(keyPath);
    await fs.ensureDir(path.dirname(absPath));
    await fs.promises.writeFile(absPath, value);
  }

  /**
   *
   * @param {String} keyPath
   * @returns Buffer
   */
  async get(keyPath) {
    if (!this.exists(keyPath)) return null;
    const absPath = this.mapPath(keyPath);
    return await fs.promises.readFile(absPath);
  }

  async del(keyPath) {
    if (this.exists(keyPath)) {
      const absPath = this.mapPath(keyPath);
      await fs.remove(absPath);
    }
  }

  exists(keyPath) {
    return fs.existsSync(this.mapPath(keyPath));
  }

  // list items in a container
  async list(keyPath) {
    if (!(await this.exists(keyPath))) return [];
    const absPath = this.mapPath(keyPath);
    const arr = await fs.promises.readdir(absPath);
    return await Promise.all(
      arr.map(async (name) => {
        const p = path.join(absPath, name);
        const stat = await fs.promises.stat(p);
        return {
          name,
          path: p,
          type: stat.isDirectory() ? 'dir' : 'file',
          size: stat.size,
          atime: stat.atimeMs,
          mtime: stat.mtimeMs,
          birthtime: stat.birthtimeMs,
          sha: null,
        };
      }),
    );
  }

  // number of items in a container
  async count(keyPath) {
    const absPath = this.mapPath(keyPath);
    const arr = await fs.promises.readdir(absPath);
    return arr.length;
  }
}

module.exports = FileStorage;
