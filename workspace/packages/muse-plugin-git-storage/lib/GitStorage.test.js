const GitStorage = require('./GitStorage');
const GitClient = require('./GitClient');

var mockGet;
var mockPut;
var mockPatch;
var mockDelete;
var mockPost;
var mockCommiterId = 'mockGitUser';
var mockEndpoint = 'mockEndpoint';
var mockOrg = mockOrg;
var mockProject = mockProject;
var mockRepo = `${mockOrg}/${mockProject}`;
var mockBranch = 'mockBranch';
var mockToken = 'mockToken';
var mockKeyPathWithoutSlash = 'mockKeyPath';
var mockKeyPath = `/${mockKeyPathWithoutSlash}`;
var mockData = 'mockData';
var mockNoContentKeyPath = '/mockNoContentKeyPath';
var mockTooLargeContentParentPath = 'mockTooLargeContentParentPath';
var mockTooLargeContentFileName = 'mockTooLargeContentFileName';
var mockTooLargeContentKeyPath = `/${mockTooLargeContentParentPath}/${mockTooLargeContentFileName}`;
var mockOtherErrorContentKeyPath = '/mockOtherErrorContentKeyPath';
var mockListKeyPath = '/mockListKeyPath';
var mockListNoContentKeyPath = '/mockListNoContentKeyPath';

var gitStorage = new GitStorage({
  endpoint: mockEndpoint,
  repo: mockRepo,
  branch: mockBranch,
  token: mockToken,
});
jest.mock('axios', () => {
  mockGet = jest.fn().mockImplementation((path) => {
    if (path === '/user') {
      return { data: { login: mockCommiterId } };
    } else if (path === `/repos/${mockRepo}/contents${mockKeyPath}`) {
      return { data: { content: mockData, sha: 'mocksha' } };
    } else if (path === `/repos/${mockRepo}/contents${mockListNoContentKeyPath}`) {
      return { data: null };
    } else if (path === `/repos/${mockRepo}/contents${mockListKeyPath}`) {
      return {
        data: [
          {
            name: mockProject,
            path: 'mockpath',
            sha: 'mocksha',
            size: 505,
            type: 'file',
          },
        ],
      };
    } else if (path === `/repos/${mockRepo}/contents${mockNoContentKeyPath}`) {
      const error = new Error('content not found');
      error.response = { status: 404 };
      throw error;
    } else if (path === `/repos/${mockRepo}/contents${mockTooLargeContentKeyPath}`) {
      const error = new Error('too large');
      error.response = { status: 403, data: { errors: [{ code: 'too_large' }] } };
      throw error;
    } else if (path === `/repos/${mockRepo}/contents${mockOtherErrorContentKeyPath}`) {
      const error = new Error('other error');
      error.response = { status: 401 };
      throw error;
    } else if (
      path === `/repos/${mockRepo}/contents/${mockTooLargeContentParentPath}?ref=${mockBranch}`
    ) {
      return {
        data: [
          {
            name: mockTooLargeContentFileName,
            sha: 'mocksha',
          },
        ],
      };
    } else if (path === `/repos/${mockRepo}/git/blobs/mocksha`) {
      return { data: { content: mockData, sha: 'mocksha' } };
    } else if (path === `/repos/${mockRepo}/git/refs/heads/${mockBranch}`) {
      return {
        data: {
          ref: 'refs/heads/${mockBranch}',
          object: {
            sha: 'mocksha',
          },
        },
      };
    } else if (path === `/repos/${mockRepo}/git/trees/mocksha?recursive=true`) {
      return {
        data: {
          sha: 'mocksha',
          tree: [
            {
              path: 'mockKeyPath/child/',
              mode: '100644',
              type: 'blob',
              sha: 'mocksha',
            },
          ],
        },
      };
    } else if (path === `/repos/${mockRepo}/branches/${mockBranch}`) {
      return {
        data: {
          name: `${mockBranch}`,
          commit: {
            sha: 'mocksha',
            commit: {
              committer: {
                name: 'mockname',
                email: 'mockname@mocksite.com',
              },
              tree: {
                sha: 'mocksha',
                url: 'mockurl',
              },
            },
          },
        },
      };
    } else if (path === `/repos/${mockRepo}/git/commits/mocksha`) {
      return { data: { tree: { sha: 'mocksha' } } };
    }
  });
  mockPut = jest.fn();
  mockPatch = jest.fn();
  mockDelete = jest.fn().mockImplementation(() => {
    return {
      data: {
        content: null,
      },
    };
  });
  mockPost = jest.fn().mockImplementation((path) => {
    return {
      data: {
        sha: 'mocksha',
      },
    };
  });

  return {
    create: function() {
      return {
        get: mockGet,
        put: mockPut,
        patch: mockPatch,
        delete: mockDelete,
        post: mockPost,
      };
    },
  };
});

describe('Git Storage Plugin tests', () => {
  beforeEach(() => {
    gitStorage.gitClient.committerId = null;
  });
  it('Git Storage Initialization success', async () => {
    require('./')({
      endpoint: 'mockEndpoint',
      repo: 'mockOrg/mockProject',
      branch: 'mockBranch',
      token: 'mockToken',
    });
  });
  it('Git Storage Initialization failed because of repo', async () => {
    expect(() =>
      require('./')({
        endpoint: 'mockEndpoint',
        pluginName: 'mockPluginName',
        branch: 'mockBranch',
        token: 'mockToken',
      }),
    ).toThrow(Error);
  });
  it('Git Storage Initialization failed because of no endpoint', async () => {
    expect(
      () =>
        new GitStorage({
          repo: 'mockOrg/mockProject',
          branch: 'mockBranch',
          token: 'mockToken',
        }),
    ).toThrow(Error);
  });

  it('Git Storage Initialization failed because of no token', async () => {
    expect(
      () =>
        new GitStorage({
          endpoint: 'mockEndpoint',
          repo: 'mockOrg/mockProject',
          branch: 'mockBranch',
        }),
    ).toThrow(Error);
  });

  it('Git Client Initialization success without branch', async () => {
    const gitClient = new GitClient({
      endpoint: 'mockEndpoint',
      repo: 'mockOrg/mockProject',
      token: 'mockToken',
    });
    expect(gitClient.branch).toEqual('main');
  });

  it('Git Client Initialization failed because of no endpoint', async () => {
    expect(
      () =>
        new GitClient({
          repo: 'mockOrg/mockProject',
          branch: 'mockBranch',
          token: 'mockToken',
        }),
    ).toThrow(Error);
  });

  it('Git Client Initialization failed because of no token', async () => {
    expect(
      () =>
        new GitClient({
          endpoint: 'mockEndpoint',
          repo: 'mockOrg/mockProject',
          branch: 'mockBranch',
        }),
    ).toThrow(Error);
  });

  it('Map Path', async () => {
    gitStorage.location = '/location';
    const absPath = gitStorage.mapPath('mockPath');
    expect(absPath).toEqual('/location/mockPath');
  });
  it('Map Path because of invalid path', async () => {
    gitStorage.location = '/location';
    await expect(() => gitStorage.mapPath('../mockPath')).toThrow(Error);
  });
  it('Set', async () => {
    await gitStorage.set(mockKeyPath, 'mockValue', 'mockMsg');
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(2);
    expect(gitStorage.gitClient.axiosGit.put).toBeCalledTimes(1);
  });

  it('Set null value', async () => {
    await gitStorage.set(mockKeyPath, null, 'mockMsg');
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(2);
    expect(gitStorage.gitClient.axiosGit.put).toBeCalledTimes(1);
  });

  it('Batch Set empty list', async () => {
    await gitStorage.gitClient.batchCommit({
      organizationName: mockOrg,
      projectName: mockProject,
      branch: mockBranch,
      message: 'mockMsg',
    });
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(2);
    expect(gitStorage.gitClient.axiosGit.put).toBeCalledTimes(0);
    expect(gitStorage.gitClient.axiosGit.delete).toBeCalledTimes(0);
  });

  it('Batch Set single file', async () => {
    await gitStorage.batchSet([{ keyPath: mockKeyPath, value: 'mockValue' }], 'mockMsg');
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(3);
    expect(gitStorage.gitClient.axiosGit.put).toBeCalledTimes(1);
  });

  it('Batch Set delete file', async () => {
    await gitStorage.batchSet([{ keyPath: mockKeyPath, value: null }], 'mockMsg');
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(3);
    expect(gitStorage.gitClient.axiosGit.delete).toBeCalledTimes(1);
  });

  it('Batch Set multiple files', async () => {
    await gitStorage.batchSet(
      [
        { keyPath: mockKeyPath, value: 'mockValue' },
        { keyPath: mockKeyPath, value: undefined },
        { keyPath: mockKeyPathWithoutSlash, value: null },
      ],
      'mockMsg',
    );
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(2);
    expect(gitStorage.gitClient.axiosGit.post).toBeCalledTimes(2);
    expect(gitStorage.gitClient.axiosGit.patch).toBeCalledTimes(1);
  });

  it('Batch Set multiple files without message', async () => {
    await gitStorage.batchSet(
      [
        { keyPath: mockKeyPath, value: 'mockValue' },
        { keyPath: mockKeyPath, value: undefined },
        { keyPath: mockKeyPathWithoutSlash, value: null },
      ],
      null,
    );
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(2);
    expect(gitStorage.gitClient.axiosGit.post).toBeCalledTimes(2);
    expect(gitStorage.gitClient.axiosGit.patch).toBeCalledTimes(1);
  });

  it('Get', async () => {
    const dataContent = await gitStorage.get(mockKeyPath);
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(1);
    expect(dataContent).toEqual(Buffer.from(mockData, 'base64').toString());
  });

  it('Fail to Get because of Content Not Found', async () => {
    const dataContent = await gitStorage.get(mockNoContentKeyPath);
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(1);
    expect(dataContent).toEqual(undefined);
  });

  it('Fail to Get because of Too Large', async () => {
    const dataContent = await gitStorage.get(mockTooLargeContentKeyPath);
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(3);
    expect(dataContent).toEqual(Buffer.from(mockData, 'base64').toString());
  });
  it('Fail to Get because of other error', async () => {
    await expect(gitStorage.get(mockOtherErrorContentKeyPath)).rejects.toThrow(Error);
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(1);
  });

  it('Get Big File without decode', async () => {
    const dataContent = await gitStorage.gitClient.getBigFile({
      organizationName: mockOrg,
      projectName: mockProject,
      branch: mockBranch,
      keyPath: mockTooLargeContentKeyPath,
      decode: false,
    });
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(2);
    expect(dataContent).toEqual(mockData);
  });
  it('Delete', async () => {
    await gitStorage.del(mockKeyPath, 'mockMsg');
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(2);
    expect(gitStorage.gitClient.axiosGit.delete).toBeCalledTimes(1);
  });
  it('Fail to Delete because of non-exists key path', async () => {
    await expect(gitStorage.del(mockNoContentKeyPath, 'mockMsg')).rejects.toThrow(Error);
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(1);
  });

  it('DeleteDir', async () => {
    await gitStorage.delDir(mockKeyPath, 'mockMsg');
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(3);
    expect(gitStorage.gitClient.axiosGit.post).toBeCalledTimes(3);
  });

  it('List', async () => {
    await gitStorage.list(mockListKeyPath);
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(1);
  });

  it('List when no files return', async () => {
    const list = await gitStorage.list(mockListNoContentKeyPath);
    expect(gitStorage.gitClient.axiosGit.get).toBeCalledTimes(1);
    expect(list.length).toEqual(0);
  });
});
