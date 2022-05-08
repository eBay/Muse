const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const log = require('../log');
const cacheDir = require('./cacheDir');
const timestampFile = path.join(cacheDir, '_internal/timestamps.json');

// gist from: https://gist.github.com/jakub-g/5903dc7e4028133704a4
function cleanEmptyFoldersRecursively(folder) {
  var fs = require('fs');
  var path = require('path');
  var isDir = fs.statSync(folder).isDirectory();
  if (!isDir) {
    return;
  }
  var files = fs.readdirSync(folder);
  if (files.length > 0) {
    files.forEach(function (file) {
      var fullPath = path.join(folder, file);
      cleanEmptyFoldersRecursively(fullPath);
    });
    // re-evaluate files; after deleting subfolder
    // we may have parent folder empty now
    files = fs.readdirSync(folder);
  }
  if (files.length == 0) {
    if (!folder.startsWith(path.join(cacheDir, '/_internal'))) {
      log.info('removing: ', folder);
      fs.rmdirSync(folder);
    }
    return;
  }
}

class LruDiskCache {
  constructor({ maxAge = 30 * 24 * 3600 } = {}) {
    // max age in seconds
    fs.ensureDirSync(cacheDir);
    fs.ensureDirSync(path.join(cacheDir, '_internal'));
    // default 30 days
    this.timestamps = {}; // last access time
    this.maxAge = maxAge * 1000;
    if (fs.existsSync(timestampFile)) {
      try {
        this.timestamps = fs.readJsonSync(timestampFile);
      } catch (err) {
        // do nothing
      }
    }

    this.cleanDeadFiles();
    this.freeupSpace();

    // Dump timestamps every 10 minutes
    setInterval(() => {
      this.saveTimestamps();
    }, 1000 * 600);
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

    const keys = getFiles(cacheDir)
      .map((f) => f.replace(cacheDir, ''))
      .filter((key) => !key.startsWith('/_internal/'));

    // if a cache file doesn't have timestamp, remove it.
    keys.forEach((key) => {
      if (!this.timestamps[key]) fs.removeSync(path.join(cacheDir, key));
    });

    cleanEmptyFoldersRecursively(cacheDir);
  }

  get(key) {
    if (!fs.existsSync(path.join(cacheDir, key))) {
      delete this.timestamps[key];
      return undefined;
    }
    log.info(`Hit disk: ${key}`);
    this.timestamps[key] = Date.now();
    return fs.readFileSync(path.join(cacheDir, key));
  }

  set(key, content) {
    // content should be buffer
    try {
      this.freeupSpace();
    } catch (err) {
      log.info('Failed to freeup space.');
      console.log(err);
    }
    if (typeof content === 'string') {
      content = Buffer.from(content);
    }
    fs.outputFileSync(path.join(cacheDir, key), content);
    this.updateTimestamp(key);
    this.saveTimestamps();
  }

  del(key) {
    delete this.timestamps[key];
    fs.removeSync(path.join(cacheDir, key));
  }

  updateTimestamp(key) {
    this.timestamps[key] = Date.now();
  }

  saveTimestamps() {
    // read first to support multiple workers.
    const tss = fs.readJsonSync(timestampFile, { throws: false }) || {};
    this.timestamps = _.mergeWith(tss, this.timestamps, (a, b) => Math.max(a || 0, b || 0));
    fs.outputJsonSync(timestampFile, this.timestamps);
  }
  // dont calculate size, if too many files, just reduce maxAge
  freeupSpace() {
    // always use the disk file timestamp
    if (!fs.existsSync(timestampFile)) return;
    const tss = fs.readJsonSync(timestampFile);
    const now = Date.now();
    for (const key in tss) {
      const t = tss[key];
      if (t + this.maxAge < now) {
        log.info(`Remove expiry disk file: ${key}@${t}`);
        delete tss[key];
        this.del(key);
      }
    }
    fs.outputJsonSync(timestampFile, tss);
  }
}

module.exports = LruDiskCache;
