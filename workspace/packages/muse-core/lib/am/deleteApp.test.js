const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('..');

const testJsPlugin = {
  name: 'test',
  museCore: {
    am: {
      deleteApp: jest.fn(),
      beforeDeleteApp: jest.fn(),
      afterDeleteApp: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);
describe('Delete app basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Delete app should delete the app folder', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });
    await muse.am.deleteApp({ appName, author: 'nate' });

    const app = await muse.am.getApp(appName);
    expect(app).toBeUndefined;
    expect(testJsPlugin.museCore.am.deleteApp).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.beforeDeleteApp).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.afterDeleteApp).toBeCalledTimes(1);
  });
  it('Fail to Delete app should throw the error', async () => {
    const testJsPluginFails = {
      name: 'testFail',
      museCore: {
        am: {
          deleteApp: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeDeleteApp: jest.fn(),
          afterDeleteApp: jest.fn(),
          failedDeleteApp: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);
    const appName = 'testapp';
    const envName = 'staging';
    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });

    try {
      await muse.am.deleteApp({ appName, author: 'nate' });
      expect(true).toBe(false); // above statement should throw error
    } catch (e) {
      expect(e.message).toEqual('Async error');
    }

    expect(testJsPluginFails.museCore.am.deleteApp).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.am.beforeDeleteApp).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.am.afterDeleteApp).toBeCalledTimes(0);
    expect(testJsPluginFails.museCore.am.failedDeleteApp).toBeCalledTimes(1);
  });
});
