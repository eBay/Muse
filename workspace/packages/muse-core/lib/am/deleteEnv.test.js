const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    am: {
      deleteEnv: jest.fn(),
      beforeDeleteEnv: jest.fn(),
      afterDeleteEnv: jest.fn(),
      failedDeleteEnv: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Delete env basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('Delete env should work', async () => {
    const appName = 'testapp';
    const envName = 'feature';
    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.deleteEnv({ appName, envName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });
    await muse.am.deleteEnv({ appName, envName, author: 'nate' });

    const app = await muse.am.getApp(appName);
    expect(app.envs?.feature).toBeUndefined();
    expect(testJsPlugin.museCore.am.deleteEnv).toBeCalledTimes(2);
    expect(testJsPlugin.museCore.am.beforeDeleteEnv).toBeCalledTimes(2);
    expect(testJsPlugin.museCore.am.afterDeleteEnv).toBeCalledTimes(2);
  });

  it('Fail to Delete env should throw the error', async () => {
    const testJsPluginFails = {
      name: 'testFail',
      museCore: {
        am: {
          deleteEnv: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeDeleteEnv: jest.fn(),
          afterDeleteEnv: jest.fn(),
          failedDeleteEnv: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);
    const appName = 'testapp';
    const envName = 'feature';
    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });
    try {
      await muse.am.deleteEnv({ appName, envName, author: 'nate' });
      expect(true).toBe(false); // above statement should throw error
    } catch (e) {
      expect(e.message).toEqual('Async error');
    }

    expect(testJsPluginFails.museCore.am.deleteEnv).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.am.beforeDeleteEnv).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.am.afterDeleteEnv).toBeCalledTimes(0);
    expect(testJsPluginFails.museCore.am.failedDeleteEnv).toBeCalledTimes(1);
  });
});
