const path = require('path');
const os = require('os');
const GitClient = require('./GitClient');

class GitStorage {
  constructor(options) {
    if (!options?.url) throw new Error('No github repo specified for GitStorage.');
    if (!options?.token) throw new Error('No PAT(Personal access tokens) specified for GitStorage.');
    if (!options?.organizationName) throw new Error('No organizationName specified for GitStorage.');
    if (!options?.projectName) throw new Error('No projectName specified for GitStorage.');

    this.url = options.url;
    this.token = options.token;
    this.organizationName = options.organizationName;
    this.projectName = options.projectName;
    this.author = os.userInfo().username;

    this.gitClient = new GitClient({
      url: this.url,
      token: this.token,
    });
  }

  init() {
    console.log('GitStorage init...')
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
  async set(keyPath, value, msg) {
    console.log('set---------');
    console.log('keyPath: ', keyPath);
    return await this.gitClient.commitFile({
      keyPath,
      value,
      organizationName: this.organizationName,
      projectName: this.projectName,
      message: msg,
      author: this.author
    })
  }

  /**
   *
   * @param {String} keyPath
   * @returns Buffer
   */
  async get(keyPath) {
    console.log('get---------');
    console.log('keyPath: ', keyPath);
    return await this.gitClient.getRepoContent({
      keyPath,
      organizationName: this.organizationName,
      projectName: this.projectName,
    });
  }

  async del(keyPath) {
    console.log('del---------');
    console.log('keyPath: ', keyPath);
    try {
      const file = this.gitClient.checkFileExist({ organizationName: this.organizationName, projectName: this.projectName, keyPath });
      if (!file) {
        return this.gitClient.deleteFile({
          organizationName: this.organizationName,
          projectName: this.projectName,
          keyPath,
          branch: 'main',
          file,
          message: `Delete file: ${keyPath}`
        });
      }
    } catch (err) {
      console.log('delete error:', err);
    }
  }


  // list items in a container
  async list(keyPath) {
    console.log('list---------');
    console.log('keyPath: ', keyPath);
    const files = await this.gitClient.getRepoContent({
      organizationName: this.organizationName,
      projectName: this.projectName,
      keyPath,
      list: true,
    });
    return files.map(({ name, path, type, size, sha }) => {
      return {
        name,
        path,
        type,
        size,
        sha,
      };
    });
  }
}

module.exports = GitStorage;