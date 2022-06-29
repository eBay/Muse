const axios = require('axios');
const logger = require('@ebay/muse-core').logger.createLogger('git-storage-plugin.GitClient');

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
      await this.axiosGit.put(`/repos/${repo}/contents${keyPath}`, payload);
    }
  }

  async getRepoContent(params) {
    logger.silly(`Get content: ${params.keyPath}`);
    const { organizationName, projectName, branch = this.branch, keyPath } = params || {};
    const repo = `${organizationName}/${projectName}`;

    return (
      await this.axiosGit.get(`/repos/${repo}/contents${keyPath}`, {
        params: {
          ref: branch,
        },
      })
    ).data;
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

  async deleteFolder(params = {}) {
    const { organizationName, projectName, keyPath, branch = this.branch, message } = params;
    const repo = `${organizationName}/${projectName}`;
    const TYPE = { BLOB: 'blob', TREE: 'tree' };
    // Get the sha of the last commit on BRANCH_NAME
    const {
      data: {
        object: { sha: currentCommitSha },
      },
    } = await this.axiosGit.get(`/repos/${repo}/git/refs/heads/${branch}`);

    // Get the sha of the root tree on the commit retrieved previously
    const {
      data: {
        tree: { sha: treeSha },
      },
    } = await this.axiosGit.get(`/repos/${repo}/git/commits/${currentCommitSha}`);

    // Get the tree corresponding to the folder that must be deleted.
    // Uses the recursive query parameter to retrieve all files whatever the depth.
    // The result might come back truncated if the number of hits is big.
    // This truncated output case is NOT handled.
    const {
      data: { tree: oldTree },
    } = await this.axiosGit.get(`/repos/${repo}/git/trees/${treeSha}?recursive=true`);

    // Create a tree to edit the content of the repository, basically select all files
    // in the previous tree and mark them with sha=null to delete them.
    // The folder only exists in git if it has a file in its offspring.
    const newTree = oldTree
      .filter(({ type, path }) => type === TYPE.BLOB && path.startsWith(`${keyPath.slice(1)}/`))
      .map(({ path, mode, type }) => ({ path, sha: null, mode, type })); // If sha is null => the file gets deleted

    // Create a new tree with the file offspring of the target folder removed
    const {
      data: { sha: newTreeSha },
    } = await this.axiosGit.post(`/repos/${repo}/git/trees`, {
      base_tree: treeSha,
      tree: newTree,
    });

    // Create a commit that uses the tree created above
    const {
      data: { sha: newCommitSha },
    } = await this.axiosGit.post(`/repos/${repo}/git/commits`, {
      message,
      tree: newTreeSha,
      parents: [currentCommitSha],
    });

    // Make BRANCH_NAME point to the created commit
    await this.axiosGit.post(`/repos/${repo}/git/refs/heads/${branch}`, { sha: newCommitSha });
  }
};
