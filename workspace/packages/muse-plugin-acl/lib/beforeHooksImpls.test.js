const yaml = require('js-yaml');
const museCore = require('@ebay/muse-core');
const plugin = require('js-plugin');

//jest.mock('js-plugin');
describe('Before Hooks Impls For tests', () => {
  let beforeHooksImpls;
  beforeEach(() => {
    beforeHooksImpls = require('./beforeHooksImpls')();
  });
  it('Before Delete App', async () => {
    beforeHooksImpls.museCore.am.beforeDeleteApp();
  });
  it('Before Deploy Plugin', async () => {
    jest.spyOn(museCore.storage.registry, 'get').mockImplementation(() => {
      return yaml.dump({ owners: 'mockUser', app: 'mockAppName' });
    });
    beforeHooksImpls.museCore.pm.beforeDeployPlugin('', {
      appName: 'mockAppName',
      author: 'mockUser',
      envMap: {
        dev: { pluginName: 'mockPluginName' },
        prod: undefined,
      },
    });
  });
  it('Before Deploy Plugin with empty env map', async () => {
    jest.spyOn(museCore.storage.registry, 'get').mockImplementation(() => {
      return yaml.dump({ owners: 'mockUser' });
    });
    beforeHooksImpls.museCore.pm.beforeDeployPlugin();
  });
  it('Before Deploy Plugin failed because of unauthorization', async () => {
    jest.spyOn(museCore.storage.registry, 'get').mockImplementation(() => {
      return null;
    });
    jest.spyOn(plugin, 'invoke').mockImplementation((path) => {
      if (path === '!museACL.deployPlugin.roles') return [{ admin: false }];
    });
    await expect(
      beforeHooksImpls.museCore.pm.beforeDeployPlugin('', {
        appName: 'mockAppName',
        envMap: {
          dev: { pluginName: 'mockPluginName' },
          prod: {},
        },
      }),
    ).rejects.toThrow(Error);
  });
  it('Delete Plugin success', async () => {
    jest.spyOn(museCore.storage.registry, 'get').mockImplementation(() => {
      return yaml.dump({ owners: 'mockUser' });
    });
    beforeHooksImpls.museCore.pm.deletePlugin('', {
      pluginName: 'mockPluginName',
      author: 'mockUser',
    });
  });
  it('Delete Plugin failed because of unauthorization', async () => {
    jest.spyOn(museCore.storage.registry, 'get').mockImplementation(() => {
      return yaml.dump({ owners: 'mockUser' });
    });

    await expect(
      beforeHooksImpls.museCore.pm.deletePlugin('', {
        pluginName: 'mockPluginName',
        author: 'mockNonAuthUser',
      }),
    ).rejects.toThrow(Error);
  });
});
