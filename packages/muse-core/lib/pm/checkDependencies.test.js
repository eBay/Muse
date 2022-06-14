jest.mock('./getDeployedPlugins');
jest.mock('../storage');

const { vol } = require('memfs');
const checkDependencies = require('./checkDependencies');
const { assets } = require('../storage');
const getDeployedPlugins = require('./getDeployedPlugins');

describe('Check Dependencies tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Finds missing deps and returns no-empty JSON', async () => {
    const mockedDepsResult = {
      content: {
        '@ebay/muse-react@1.0.0': ['missing-lib@1.1.1', 'another-missing-lib@1.0.0'],
      },
    };
    const mockedLibManifestResult = {
      type: 'lib',
      content: {
        '@babel/runtime@7.18.3/arrayLikeToArray.js': {},
      },
    };
    const mockedDeployedPlugins = [
      {
        type: 'lib',
        name: '@ebay/muse-react',
        version: '1.0.0',
      },
    ];
    assets.getJson = jest
      .fn()
      .mockImplementationOnce((cb) => mockedDepsResult)
      .mockImplementationOnce((cb) => mockedLibManifestResult);

    getDeployedPlugins.mockImplementation((cb, ca) => mockedDeployedPlugins);

    const result = await checkDependencies({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'muse-layout',
      version: '1.0.0',
    });

    expect(result).not.toBeNull();
    expect(Object.keys(result).length).toBe(1);
    expect(Object.keys(result)[0]).toBe('@ebay/muse-react@1.0.0');
  });

  it('Returns empty JSON if no dependencies are missing', async () => {
    const mockedDepsResult = {
      content: {
        '@ebay/muse-react@1.0.0': ['@babel/runtime@7.18.3/arrayLikeToArray.js'],
      },
    };
    const mockedLibManifestResult = {
      type: 'lib',
      content: {
        '@babel/runtime@7.18.3/arrayLikeToArray.js': {},
      },
    };
    const mockedDeployedPlugins = [
      {
        type: 'lib',
        name: '@ebay/muse-react',
        version: '1.0.0',
      },
    ];
    assets.getJson = jest
      .fn()
      .mockImplementationOnce((cb) => mockedDepsResult)
      .mockImplementationOnce((cb) => mockedLibManifestResult);

    getDeployedPlugins.mockImplementation((cb, ca) => mockedDeployedPlugins);

    const result = await checkDependencies({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'muse-layout',
      version: '1.0.0',
    });

    expect(result).not.toBeNull();
    expect(Object.keys(result).length).toBe(0);
  });

  it('Returns empty JSON if no library plugins are deployed yet', async () => {
    const mockedDepsResult = {
      content: {
        '@ebay/muse-react@1.0.0': ['@babel/runtime@7.18.3/arrayLikeToArray.js'],
      },
    };
    const mockedLibManifestResult = {
      type: 'lib',
      content: {
        '@babel/runtime@7.18.3/arrayLikeToArray.js': {},
      },
    };
    const mockedDeployedPlugins = [];
    assets.getJson = jest
      .fn()
      .mockImplementationOnce((cb) => mockedDepsResult)
      .mockImplementationOnce((cb) => mockedLibManifestResult);

    getDeployedPlugins.mockImplementation((cb, ca) => mockedDeployedPlugins);

    const result = await checkDependencies({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'muse-layout',
      version: '1.0.0',
    });

    expect(result).not.toBeNull();
    expect(Object.keys(result).length).toBe(0);
  });

  it('Returns empty JSON if no deps-manifest.json available for the plugin to be deployed', async () => {
    const mockedDepsResult = null;
    const mockedLibManifestResult = {
      type: 'lib',
      content: {
        '@babel/runtime@7.18.3/arrayLikeToArray.js': {},
      },
    };
    const mockedDeployedPlugins = [
      {
        type: 'lib',
        name: '@ebay/muse-react',
        version: '1.0.0',
      },
    ];
    assets.getJson = jest
      .fn()
      .mockImplementationOnce((cb) => mockedDepsResult)
      .mockImplementationOnce((cb) => mockedLibManifestResult);

    getDeployedPlugins.mockImplementation((cb, ca) => mockedDeployedPlugins);

    const result = await checkDependencies({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'muse-layout',
      version: '1.0.0',
    });

    expect(result).not.toBeNull();
    expect(Object.keys(result).length).toBe(0);
  });

  it('Returns empty JSON if no lib-manifest.json found', async () => {
    const mockedDepsResult = {
      content: {
        '@ebay/muse-react@1.0.0': ['@babel/runtime@7.18.3/arrayLikeToArray.js'],
      },
    };
    const mockedLibManifestResult = null;
    const mockedDeployedPlugins = [
      {
        type: 'lib',
        name: '@ebay/muse-react',
        version: '1.0.0',
      },
    ];
    assets.getJson = jest
      .fn()
      .mockImplementationOnce((cb) => mockedDepsResult)
      .mockImplementationOnce((cb) => mockedLibManifestResult);

    getDeployedPlugins.mockImplementation((cb, ca) => mockedDeployedPlugins);

    const result = await checkDependencies({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'muse-layout',
      version: '1.0.0',
    });

    expect(result).not.toBeNull();
    expect(Object.keys(result).length).toBe(0);
  });
});
