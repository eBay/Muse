const { vol } = require('memfs');
const muse = require('../');
const plugin = require('js-plugin');

describe('Set app icon basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('Set app icon should work', async () => {
    const appName = 'testapp';
    await muse.am.createApp({ appName, author: 'nate' });

    await muse.am.setAppIcon({
      appName: 'testapp',
      icon: Buffer.from('someicon'),
    });
    const icon = await muse.storage.assets.getString(`/p/app-icon.${appName}/v0.0.1/dist/icon.png`);
    expect(icon).toEqual('someicon');
  });

  it('Fail to set App icon should throw the error', async () => {
    const testJsPluginFails = {
      name: 'testFail',
      museCore: {
        am: {
          setAppIcon: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeSetAppIcon: jest.fn(),
          afterSetAppIcon: jest.fn(),
          failedSetAppIcon: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);
    const appName = 'testappFails';
    await muse.am.createApp({ appName, author: 'nate' });

    try {
      await muse.am.setAppIcon({
        appName: 'testappFails',
        icon: Buffer.from('someicon'),
      });
    } catch (e) {
      expect(e.message).toEqual('Async error');
    }

    expect(testJsPluginFails.museCore.am.setAppIcon).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.am.beforeSetAppIcon).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.am.afterSetAppIcon).toBeCalledTimes(0);
    expect(testJsPluginFails.museCore.am.failedSetAppIcon).toBeCalledTimes(1);
  });
});
