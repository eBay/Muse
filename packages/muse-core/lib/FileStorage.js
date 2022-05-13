const path = require('path');
// const os = require('os');
const fs = require('fs-extra');

module.exports = {
  init(options) {
    if (!options?.location) throw new Error('No location specified for FileStorage.');
    this.location = options.location;
    this.name = options.name || 'file-storage';
  },

  mapPath(p) {
    const absPath = path.resolve(this.location, p.replace());
    if (!p.startsWith(this.location)) {
      throw new Error('Can not access path out of ' + this.location);
    }
    return absPath;
  },

  // value: Buffer
  async set(path, value) {
    const absPath = this.mapPath(path);
    await fs.ensureDir(path.dirname(absPath));
    await fs.promises.writeFile(absPath, value);
  },

  async get(path) {
    const absPath = this.mapPath(path);
    if (!fs.existsSync(absPath)) return null;
    await fs.ensureDir(path.dirname(absPath));
    return await fs.promises.readFile(absPath);
  },

  async exist(path) {
    return fs.existsSync(this.mapPath(path));
  },

  // list items in a container
  async list(path) {
    const absPath = this.mapPath(path);
  },

  // number of items in a container
  async count(path) {},
};
