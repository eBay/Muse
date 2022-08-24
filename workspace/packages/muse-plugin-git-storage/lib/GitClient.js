const axios = require('axios');
const logger = require('@ebay/muse-core').logger.createLogger('git-storage-plugin.GitClient');
const museCore = require('@ebay/muse-core');
const yaml = require('js-yaml');
const fs = require('fs');
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
    const httpsAgent = new (require('https').Agent)({
      rejectUnauthorized: false,
    });
    return axios.create({
      baseURL: this.endpoint, //`${this.endpoint}/api/v3`,
      timeout: 60000,
      maxContentLength: 100000000,
      maxBodyLength: 1000000000,
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      httpsAgent,
    });
  }

  async getCommitterId() {
    if (!this.committerId) {
      this.committerId = (await this.axiosGit.get('/user')).data.login;
    }

    return this.committerId;
  }

  /** Create or update file contents */
  async commitFile(params) {
    logger.silly(`Committing file: ${params.keyPath}`);
    const { branch = this.branch, message, keyPath, value, organizationName, projectName } = params;
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
      content: (value && Buffer.from(value).toString('base64')) || undefined,
      branch,
      committer,
      author,
      sha,
    };
    await this.axiosGit.put(`/repos/${repo}/contents${keyPath}`, payload);
  }

  async batchCommit(params) {
    const {
      organizationName,
      projectName,
      items = [],
      branch = this.branch,
      message,
      author: authorId,
    } = params;

    const repo = `${organizationName}/${projectName}`;

    logger.info(`Commiting files to ${repo}...`);
    logger.info('Get branch info for head sha...');
    const branchInfo = (await this.axiosGit.get(`/repos/${repo}/branches/${branch}`)).data;
    let latestCommitSha = branchInfo.commit.sha;
    const treeSha = branchInfo.commit.commit.tree.sha;

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

    // If multiple files are changed, need to create a commit to apply changes.
    // Otherwise use file API for creation, update or deletion for better performance.
    if (items.length > 1) {
      logger.info('Getting commits tree data...');
      const tree = items.map(({ keyPath, value }) => {
        const obj = { path: keyPath.startsWith('/') ? keyPath.slice(1) : keyPath, mode: '100644' };
        const content = museCore.utils.jsonByYamlBuff(value);
        if (content === null) {
          obj.sha = null;
        } else {
          obj.content = yaml.dump(content);
        }
        return obj;
      });

      // Create tree
      logger.info('Creating the tree for the commit...');
      let response = await this.axiosGit.post(`/repos/${repo}/git/trees`, {
        base_tree: treeSha,
        tree,
      });

      const newTreeSha = response.data.sha;
      const params = {
        message,
        tree: newTreeSha,
        parents: [latestCommitSha],
        committer,
        author,
      };

      logger.info('Creating commit...');
      response = await this.axiosGit.post(`/repos/${repo}/git/commits`, params);
      latestCommitSha = response.data.sha;

      logger.info(`Updating branch ${branch} head...`);
      await this.axiosGit.patch(`/repos/${repo}/git/refs/heads/${branch}`, {
        sha: latestCommitSha,
      });
    } else if (items.length === 1) {
      const { keyPath, value } = items[0];
      const [, , appName, envName, pluginYaml] = keyPath.split('/');
      const content = museCore.utils.jsonByYamlBuff(value);

      if (content === null) {
        await this.deleteFile({
          organizationName,
          projectName,
          keyPath,
          branch,
          message: `Undeploy plugin ${pluginYaml.replace(
            '.yaml',
            '',
          )} from ${appName}/${envName} by ${authorId}`,
        });
      } else {
        await this.commitFile({
          ...params,
          keyPath: keyPath,
          value,
          message: `Deploy plugin ${pluginYaml.replace(
            '.yaml',
            '',
          )} to ${appName}/${envName} by ${authorId}`,
        });
      }
    }
    logger.info(`Batch Commit success.`);
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
    )?.data;
  }

  // Read a file content up to 1 megabyte in size
  async getBigFile(params) {
    const { organizationName, projectName, keyPath, branch = this.branch, decode = true } =
      params || {};
    const repo = `${organizationName}/${projectName}`;
    const arr = keyPath.split('/');
    const filename = arr.pop();
    const parentPath = arr.join('/');
    const folder = (await this.axiosGit.get(`/repos/${repo}/contents/${parentPath}?ref=${branch}`))
      .data;
    const fileSha = folder.find(file => file.name === filename)?.sha;
    const blob = (await this.axiosGit.get(`/repos/${repo}/git/blobs/${fileSha}`)).data;
    return decode ? Buffer.from(blob.content, 'base64').toString() : blob.content;
  }

  /** Deletes a file in a repository. */
  async deleteFile(params) {
    logger.silly(`Delete file: ${params.keyPath}`);
    const { organizationName, projectName, keyPath, branch = this.branch, message } = params;

    let file;
    try {
      file = await this.getRepoContent({
        organizationName,
        projectName,
        branch,
        keyPath,
      });
    } catch (err) {
      throw new Error(`${keyPath} not exist in repo ${organizationName}/${projectName}`);
    }

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
