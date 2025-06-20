const path = require('path');
const logger = require('@ebay/muse-core').logger.createLogger('git-storage-plugin.GitStorage');
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
    });
  }

  async batchSet(items, msg) {
    return await this.gitClient.batchCommit({
      organizationName: this.organizationName,
      projectName: this.projectName,
      items,
      message: msg,
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
      if (data?.content === '' && data?.encoding === 'none') {
        // empty file content with encoding none means it's a big file
        // See: https://docs.github.com/en/enterprise-server@3.12/rest/repos/contents?apiVersion=2022-11-28#get-repository-content
        return await this.gitClient.getBigFile({
          keyPath,
          organizationName: this.organizationName,
          projectName: this.projectName,
        });
      }
      return Buffer.from(data?.content, 'base64').toString();
    } catch (err) {
      if (err?.response?.status === 404) {
        logger.debug('Content Not Found.');
      } else if (
        err?.response?.status === 403 &&
        err?.response?.data?.errors?.find((e) => e.code === 'too_large')
      ) {
        const data = await this.gitClient.getBigFile({
          keyPath,
          organizationName: this.organizationName,
          projectName: this.projectName,
        });
        return data;
      } else {
        throw err;
      }
      return;
    }
  }

  async del(keyPath, msg) {
    logger.verbose(`Delete value: ${keyPath}`);
    return await this.gitClient.deleteFile({
      organizationName: this.organizationName,
      projectName: this.projectName,
      keyPath,
      message: msg,
    });
  }

  async delDir(keyPath, msg) {
    logger.verbose(`Delete dir: ${keyPath}`);
    return await this.gitClient.deleteFolder({
      organizationName: this.organizationName,
      projectName: this.projectName,
      keyPath,
      message: msg,
    });
  }

  // list items in a container
  async list(keyPath) {
    logger.verbose(`List dir: ${keyPath}`);

    try {
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
    } catch (err) {
      if (err.response?.status === 404) return [];
      throw err;
    }
  }
}

module.exports = GitStorage;
