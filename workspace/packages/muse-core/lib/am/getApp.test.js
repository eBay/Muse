const { vol } = require('memfs');
const muse = require('../');
const plugin = require('js-plugin');

jest.mock('fs');
jest.mock('fs/promises');

describe('Get app basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Get app should return correct json', async () => {
    const appName = 'testapp';
    await muse.am.createApp({ appName, author: 'nate' });
    const result = await muse.am.getApp(appName);
    expect(result).toMatchObject({ name: appName, createdBy: 'nate', owners: ['nate'] });
  });

  it('It returns null if plugin not exists.', async () => {
    const appName = 'test-app-not-exist';
    const app = await muse.am.getApp(appName);
    expect(app).toBe(null);
  });

  it('Fail to get app should throw the error', async () => {
    const appName = 'testapp-fails';
    const testJsPluginFails = {
      name: 'testFail',
      museCore: {
        am: {
          getApp: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeGetApp: jest.fn(),
          afterGetApp: jest.fn(),
          failedGetApp: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);
    try {
      await muse.am.getApp(appName);
    } catch (e) {
      expect(e.message).toEqual('Async error');
    }

    expect(testJsPluginFails.museCore.am.getApp).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.am.beforeGetApp).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.am.failedGetApp).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.am.afterGetApp).toBeCalledTimes(0);
  });
});
