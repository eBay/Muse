const path = require('path');
const os = require('os');
const logger = require('muse-core').logger.createLogger('git-storage-plugin.GitStorage');
const GitClient = require('./GitClient');

class GitStorage {
  constructor(options) {
    if (!options?.endpoint) throw new Error('No github API endpoint specified for GitStorage.');
    if (!options?.token)
      throw new Error('No PAT(Personal access tokens) specified for GitStorage.');

    if (!options?.repo) throw new Error('No repo specified for GitStorage.');

    this.endpoint = options.endpoint;
    this.token = options.token;
    const arr = options.repo.split('/');
    this.organizationName = arr[0];
    this.projectName = arr[1];
    if (!this.projectName) throw new Error(`Invalid repo: ${options.repo}.`);

    this.author = os.userInfo().username;

    this.gitClient = new GitClient({
      endpoint: this.endpoint,
      token: this.token,
      branch: options.branch || 'main',
    });
  }

  init() {
    // logger.info('GitStorage init...');
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
    // logger.verbose(`Set value: ${keyPath}`);
    return await this.gitClient.commitFile({
      keyPath,
      value,
      organizationName: this.organizationName,
      projectName: this.projectName,
      message: msg,
      author: this.author,
    });
  }

  /**
   *
   * @param {String} keyPath
   * @returns Buffer
   */
  async get(keyPath) {
    logger.verbose(`Get value: ${keyPath}`);
    try {
      const data = await this.gitClient.getRepoContent({
        keyPath,
        organizationName: this.organizationName,
        projectName: this.projectName,
      });
      return Buffer.from(data?.content, 'base64').toString();
    } catch (err) {
      if (err?.response?.status === 404) {
        logger.info('Content Not Found.');
      } else {
        throw err;
      }

      return;
    }
  }

  async del(keyPath, msg) {
    logger.verbose(`Delete value: ${keyPath}`);
    const file = await this.gitClient.getRepoContent({
      organizationName: this.organizationName,
      projectName: this.projectName,
      keyPath,
    });
    if (!file) {
      logger.warn(`${keyPath} does not exist.`);
      return;
    }
    return await this.gitClient.deleteFile({
      organizationName: this.organizationName,
      projectName: this.projectName,
      keyPath,
      file,
      message: msg,
    });
  }

  // list items in a container
  async list(keyPath) {
    logger.verbose(`List dir: ${keyPath}`);

    const files = await this.gitClient.getRepoContent({
      organizationName: this.organizationName,
      projectName: this.projectName,
      keyPath,
    });
    return files
      ? files.map(({ name, path, type, size, sha }) => {
          return {
            name,
            path,
            type,
            size,
            sha,
          };
        })
      : [];
  }
}

module.exports = GitStorage;
