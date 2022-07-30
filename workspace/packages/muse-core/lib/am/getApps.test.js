const { vol } = require('memfs');
const muse = require('../');
const plugin = require('js-plugin');

jest.mock('fs');
jest.mock('fs/promises');

describe('Get apps basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Get apps', async () => {
    let apps = await muse.am.getApps();
    expect(apps.length).toBe(0);
    await muse.am.createApp({ appName: 'test', author: 'nate' });
    apps = await muse.am.getApps();
    expect(apps.length).toBe(1);
    expect(apps[0]).toMatchObject({ name: 'test', createdBy: 'nate' });
  });

  it('Fail to get apps should throw the error', async () => {
    const testJsPluginFails = {
      name: 'testFail',
      museCore: {
        am: {
          getApps: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeGetApps: jest.fn(),
          afterGetApps: jest.fn(),
          failedGetApps: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);
    try {
      await muse.am.getApps();
    } catch (e) {
      expect(e.message).toEqual('Async error');
    }

    expect(testJsPluginFails.museCore.am.getApps).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.am.beforeGetApps).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.am.afterGetApps).toBeCalledTimes(0);
    expect(testJsPluginFails.museCore.am.failedGetApps).toBeCalledTimes(1);
  });
});
