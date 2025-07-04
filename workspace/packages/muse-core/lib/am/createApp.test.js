const { vol } = require('memfs');
const plugin = require('js-plugin');
const { jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    am: {
      createApp: jest.fn(),
      beforeCreateApp: jest.fn(),
      afterCreateApp: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);
describe('Create app basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Create app should create the correct yaml file', async () => {
    const appName = 'testapp';
    await muse.am.createApp({ appName, author: 'nate' });
    const result = jsonByYamlBuff(await registry.get(`/apps/${appName}/${appName}.yaml`));
    expect(result).toMatchObject({ name: appName, createdBy: 'nate', owners: ['nate'] });
    expect(result.envs.staging).toMatchObject({ name: 'staging', createdBy: 'nate' });

    expect(testJsPlugin.museCore.am.createApp).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.beforeCreateApp).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.afterCreateApp).toBeCalledTimes(1);
  });

  it('It throws exception if plugin name exists.', async () => {
    const appName = 'testapp';
    await muse.am.createApp({ appName, author: 'nate' });

    try {
      await muse.am.createApp({ appName, author: 'nate' });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch('already exists');
    }
  });

  it('Fail to create App should throw the error', async () => {
    const testJsPluginFails = {
      name: 'testFail',
      museCore: {
        am: {
          createApp: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeCreateApp: jest.fn(),
          afterCreateApp: jest.fn(),
          failedCreateApp: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);
    const appName = 'testapp';

    try {
      await muse.am.createApp({ appName, author: 'nate' });
      expect(true).toBe(false); // above statement should throw error
    } catch (e) {
      expect(e.message).toEqual('Async error');
    }
    expect(testJsPluginFails.museCore.am.createApp).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.am.beforeCreateApp).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.am.afterCreateApp).toBeCalledTimes(0);
    expect(testJsPluginFails.museCore.am.failedCreateApp).toBeCalledTimes(1);
  });
});
