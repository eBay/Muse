const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

describe('Create plugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Build plugin should call ext points', async () => {
    const testJsPlugin = {
      name: 'test',
      museCore: {
        pm: {
          buildPlugin: jest.fn(),
          beforeBuildPlugin: jest.fn(),
          afterBuildPlugin: jest.fn(),
          failedBuildPlugin: jest.fn(),
        },
      },
    };
    plugin.register(testJsPlugin);

    await muse.pm.buildPlugin();

    expect(testJsPlugin.museCore.pm.buildPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeBuildPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterBuildPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.failedBuildPlugin).toBeCalledTimes(0);
  });

  it('fail to Build Plugin should throw the error', async () => {
    const testJsPluginFails = {
      name: 'testFails',
      museCore: {
        pm: {
          buildPlugin: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeBuildPlugin: jest.fn(),
          afterBuildPlugin: jest.fn(),
          failedBuildPlugin: jest.fn(),
        },
      },
    };

    plugin.register(testJsPluginFails);
    try {
      await muse.pm.buildPlugin();
    } catch (e) {
      expect(e.message).toEqual('Async error');
    }
    expect(testJsPluginFails.museCore.pm.failedBuildPlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.buildPlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.beforeBuildPlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.afterBuildPlugin).toBeCalledTimes(0);
  });
});
