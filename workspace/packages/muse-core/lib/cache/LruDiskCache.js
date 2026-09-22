const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const _ = require('lodash');

/**
 * @class
 */
class LruDiskCache {
  /**
   *
   * @param {object} params
   * @param {number} [params.ttl=30 * 24 * 3600 * 1000]
   * @param {string} [params.location=path.join(os.homedir(), 'muse-storage/lru-disk-cache')]
   * @param {number} [params.saveTimestampsInterval=1000 * 300]
   */
  constructor({
    // max age in milliseconds
    ttl = 30 * 24 * 3600 * 1000,
    location = path.join(os.homedir(), 'muse-storage/lru-disk-cache'),
    saveTimestampsInterval = 1000 * 300,
  } = {}) {
    fs.ensureDirSync(location);
    fs.ensureDirSync(path.join(location, '_internal'));
    this.location = location;
    this.timestampFile = path.join(location, '_internal/timestamps.json');
    // default 30 days
    this.timestamps = {}; // last access time
    this.ttl = ttl;
    if (fs.existsSync(this.timestampFile)) {
      try {
        this.timestamps = fs.readJsonSync(this.timestampFile);
      } catch (err) {
        // do nothing
      }
    }

    // Startup cleanup (cleanDeadFiles + freeupSpace) has been intentionally removed
    // from the constructor to prevent blocking the event loop on large shared PVCs
    // (e.g. 3 pods x 3 processes = 9 concurrent processes all scanning millions of
    // NFS files at once, causing 12+ hour startup hangs).
    // Use the explicit cleanDeadFiles() / freeupSpace() APIs instead, called from
    // a dedicated admin endpoint or offline maintenance job.

    // Dump timestamps every intervally
    setInterval(() => {
      this.saveTimestamps();
    }, saveTimestampsInterval).unref();
  }

  // If a file is not tracked by timestamp, delete it.
  cleanDeadFiles() {
    const getFiles = (dir) => {
      const dirents = fs.readdirSync(dir, { withFileTypes: true });
      const files = dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
      });

      return _.flatten(files);
    };

    const keys = getFiles(this.location)
      .map((f) => f.replace(this.location, ''))
      .filter((key) => !key.startsWith('/_internal/'));

    // if a cache file doesn't have timestamp, remove it.
    keys.forEach((key) => {
      if (!this.timestamps[key]) fs.removeSync(path.join(this.location, key));
    });

    this.cleanEmptyFoldersRecursively(this.location);
  }

  get(key) {
    if (!this.has(key)) {
      delete this.timestamps[key];
      return undefined;
    }

    this.timestamps[key] = Date.now();
    return fs.readFileSync(path.join(this.location, key));
  }

  getString(key) {
    const d = this.get(key);
    if (typeof d === 'undefined') return undefined;
    return d.toString();
  }

  has(key) {
    return fs.existsSync(path.join(this.location, key));
  }

  set(key, content) {
    // content should be buffer
    // Note: freeupSpace() has been removed from set() — use the explicit API instead.
    if (typeof content === 'string') {
      content = Buffer.from(content);
    }
    fs.outputFileSync(path.join(this.location, key), content);
    this.updateTimestamp(key);
    this.saveTimestamps();
  }

  del(key) {
    delete this.timestamps[key];
    fs.removeSync(path.join(this.location, key));
  }

  updateTimestamp(key) {
    this.timestamps[key] = Date.now();
  }

  saveTimestamps() {
    // Read first to support multiple workers.
    const tss = fs.readJsonSync(this.timestampFile, { throws: false }) || {};
    this.timestamps = _.mergeWith(tss, this.timestamps, (a, b) => Math.max(a || 0, b || 0));
    fs.outputJsonSync(this.timestampFile, this.timestamps, { spaces: 2 });
  }

  // Don't calculate size, if too many files, just reduce ttl
  freeupSpace() {
    // always use the disk file timestamp
    if (!fs.existsSync(this.timestampFile)) return;
    const tss = fs.readJsonSync(this.timestampFile);
    const now = Date.now();
    for (const key in tss) {
      const t = tss[key];
      if (t + this.ttl < now) {
        // log.info(`Remove expiry disk file: ${key}@${t}`);
        delete tss[key];
        this.del(key);
      }
    }
    fs.outputJsonSync(this.timestampFile, tss);
  }

  // Clean empty folders
  cleanEmptyFoldersRecursively(folder) {
    let isDir;
    try {
      isDir = fs.statSync(folder).isDirectory();
    } catch (e) {
      if (e.code === 'ENOENT') {
        // Another pod/process deleted this path concurrently during cleanup on a
        // shared PVC. The path is already gone -- that is the desired end state --
        // so return early instead of throwing.
        console.warn(
          '[LruDiskCache] Caught ENOENT in cleanEmptyFoldersRecursively ' +
            '(concurrent deletion race on shared PVC). path=' +
            folder,
        );
        return;
      }
      throw e;
    }
    if (!isDir) {
      return;
    }
    let files = fs.readdirSync(folder);
    if (files.length > 0) {
      files.forEach((file) => {
        const fullPath = path.join(folder, file);
        this.cleanEmptyFoldersRecursively(fullPath);
      });
      // Here the folder's content has been checked
      files = fs.readdirSync(folder);
    }
    if (files.length == 0) {
      if (!folder.startsWith(path.join(this.location, '/_internal'))) {
        fs.rmdirSync(folder);
      }
      return;
    }
  }
}

module.exports = LruDiskCache;
