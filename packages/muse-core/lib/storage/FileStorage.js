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
    const absPath = path.resolve(this.location, p.replace());
    if (!p.startsWith(this.location)) {
      throw new Error('Can not access path out of ' + this.location);
    }
    return absPath;
  }

  // value: Buffer
  async set(path, value) {
    const absPath = this.mapPath(path);
    await fs.ensureDir(path.dirname(absPath));
    await fs.promises.writeFile(absPath, value);
  }

  async get(path) {
    const absPath = this.mapPath(path);
    if (!fs.existsSync(absPath)) return null;
    await fs.ensureDir(path.dirname(absPath));
    return await fs.promises.readFile(absPath);
  }

  async del(path) {
    const absPath = this.mapPath(path);
    if (await this.exists(path)) {
      await fs.promises.unlink(absPath);
    }
  }

  async exists(path) {
    return fs.existsSync(this.mapPath(path));
  }

  // list items in a container
  async list(path) {
    const absPath = this.mapPath(path);
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
  async count(path) {
    const absPath = this.mapPath(path);
    const arr = await fs.promises.readdir(absPath);
    return arr.length;
  }
}

module.exports = FileStorage;
