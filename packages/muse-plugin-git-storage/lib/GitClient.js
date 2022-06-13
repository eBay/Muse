const axios = require('axios');
const _ = require('lodash');

module.exports = class GitClient {
  constructor(options) {
    if (!options.url) throw new Error('No github url specified for GitStorage.');
    if (!options.token) throw new Error('No PAT(Personal access tokens) specified for GitStorage.');
    this.url = options.url;
    this.token = options.token;
    this.axiosGit = this.init();
    this.commitFile = this.commitFile.bind(this);
  }

  init() {
    return axios.create({
      baseURL: `${this.url}/api/v3`,
      timeout: 60000,
      maxContentLength: 100000000,
      maxBodyLength: 1000000000,
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
  }

  async checkFileExist(params) {
    const { organizationName, projectName, keyPath, branch = 'main' } = params;
    const repo = `${organizationName}/${projectName}`;

    let file;
    try {
      const folder = (await this.axiosGit.get(`/repos/${repo}/contents/?ref=${branch}`)).data;
      file = _.find(folder, { name: `${keyPath}` });
    } catch (err) {
      console.log('err');
    }
    return file;
  }

  async commitFile(params) {
    const {
      branch = 'main',
      message,
      keyPath,
      value: content,
      organizationName,
      projectName,
    } = params;
    const repo = `${organizationName}/${projectName}`;
    const authorId = params.author;
    console.info(`Commiting files to ${repo}...`);

    const committer = {
      name: authorId,
      email: `${authorId}@ebay.com`,
      date: new Date().toISOString(),
    };

    const author = {
      name: authorId,
      email: `${authorId}@ebay.com`,
      date: new Date().toISOString(),
    };

    let sha = null;
    try {
      console.info('Getting file sha...');
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
      console.info('Deleting file: ' + keyPath);
      await this.axiosGit.delete(`/repos/${repo}/contents${keyPath}`, { params: payload });
    } else {
      // Add or update file
      console.info('Putting file: ' + keyPath);
      try {
        await this.axiosGit.put(`/repos/${repo}/contents${keyPath}`, payload);
      } catch (err) {
        console.log('set error:', err);
      }
    }
    console.info(`Commit success.`);
  }

  async getRepoContent(params) {
    const {
      organizationName,
      projectName,
      keyPath,
      branch = 'main',
      decode = true,
      list = false,
    } = params || {};
    const repo = `${organizationName}/${projectName}`;

    try {
      const res = await this.axiosGit.get(`/repos/${repo}/contents${keyPath}`, {
        params: {
          ref: branch,
        },
      });
      if (list) return res?.data;
      const content = decode
        ? Buffer.from(res.data.content, 'base64').toString()
        : res.data.content;
      return content;
    } catch (err) {
      console.log('Not Found:', `${keyPath}`);
      return;
    }
  }

  async deleteFile(params) {
    const { organizationName, projectName, keyPath, branch = 'main', file, message } = params;
    const repo = `${organizationName}/${projectName}`;
    const authorId = params.author;
    const committer = {
      name: authorId,
      email: `${authorId}@ebay.com`,
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
