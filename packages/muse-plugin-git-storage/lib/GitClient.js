const axios = require('axios');
const logger = require('muse-core').logger.createLogger('git-storage-plugin.GitClient');

module.exports = class GitClient {
  constructor(options) {
    if (!options.endpoint) throw new Error('No github endpoint specified for GitStorage.');
    if (!options.token) throw new Error('No PAT(Personal access tokens) specified for GitStorage.');
    this.endpoint = options.endpoint;
    this.token = options.token;
    this.axiosGit = this.initGitClient();
    this.commitFile = this.commitFile.bind(this);
    this.branch = options.branch || 'main';
  }

  initGitClient() {
    return axios.create({
      baseURL: this.endpoint, //`${this.endpoint}/api/v3`,
      timeout: 60000,
      maxContentLength: 100000000,
      maxBodyLength: 1000000000,
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
  }

  async getCommitterId() {
    if (!this.committerId) {
      this.committerId = (await this.axiosGit.get('/user')).data.login;
    }

    return this.committerId;
  }

  async commitFile(params) {
    logger.silly(`Committing file: ${params.keyPath}`);
    const {
      branch = this.branch,
      message,
      keyPath,
      value: content,
      organizationName,
      projectName,
    } = params;
    const repo = `${organizationName}/${projectName}`;
    const authorId = params.author;

    const committerId = await this.getCommitterId();

    const committer = {
      name: committerId,
      email: `${committerId}@ebay.com`,
      date: new Date().toISOString(),
    };

    const author = {
      name: authorId,
      email: `${authorId}@ebay.com`,
      date: new Date().toISOString(),
    };

    let sha = null;
    try {
      const exist = (
        await this.axiosGit.get(`/repos/${repo}/contents${keyPath}`, {
          params: { ref: branch },
        })
      ).data;
      sha = exist.sha;
    } catch (e) {} // eslint-disable-line

    const payload = {
      message,
      content: (content && Buffer.from(content).toString('base64')) || undefined,
      branch,
      committer,
      author,
      sha,
    };
    if (content === null) {
      // Delete file
      await this.axiosGit.delete(`/repos/${repo}/contents${keyPath}`, { params: payload });
    } else {
      // Add or update file
      try {
        await this.axiosGit.put(`/repos/${repo}/contents${keyPath}`, payload);
      } catch (err) {
        console.log('set error:', err);
      }
    }
  }

  async getRepoContent(params) {
    logger.silly(`Get content: ${params.keyPath}`);
    const { organizationName, projectName, branch = this.branch, keyPath } = params || {};
    const repo = `${organizationName}/${projectName}`;

    try {
      return (
        await this.axiosGit.get(`/repos/${repo}/contents${keyPath}`, {
          params: {
            ref: branch,
          },
        })
      ).data;
    } catch (err) {
      // console.log('Not Found:', `${keyPath}`);
      return;
    }
  }

  async deleteFile(params) {
    logger.silly(`Delete file: ${params.keyPath}`);
    const { organizationName, projectName, keyPath, branch = this.branch, file, message } = params;
    const repo = `${organizationName}/${projectName}`;
    const authorId = params.author;
    const committerId = await this.getCommitterId();
    const committer = {
      name: committerId,
      email: `${committerId}@ebay.com`,
      date: new Date().toISOString(),
    };

    const author = {
      name: authorId,
      email: `${authorId}@ebay.com`,
      date: new Date().toISOString(),
    };
    return (
      await this.axiosGit.delete(`/repos/${repo}/contents${keyPath}`, {
        params: {
          message: message || `Delete file ${keyPath}.`,
          sha: file.sha,
          branch,
          committer,
          author,
        },
      })
    ).data;
  }
};
