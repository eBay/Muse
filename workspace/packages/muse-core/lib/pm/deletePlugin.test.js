const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

jest.mock('fs');
jest.mock('fs/promises');

const testJsPlugin = {
  name: 'test',
  museCore: {
    pm: {
      deletePlugin: jest.fn(),
      beforeDeletePlugin: jest.fn(),
      afterDeletePlugin: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Delete plugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Delete plugin should work', async () => {
    const pluginName = 'test-plugin';
    await muse.pm.createPlugin({ pluginName, author: 'gling' });
    const result = await muse.pm.getPlugin(pluginName);
    expect(result).toMatchObject({ name: pluginName, createdBy: 'gling', owners: ['gling'] });
    await muse.pm.deletePlugin({ pluginName, author: 'gling' });

    const result2 = await muse.pm.getPlugin(pluginName);
    expect(result2).toBeUndefined;

    expect(testJsPlugin.museCore.pm.deletePlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeDeletePlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterDeletePlugin).toBeCalledTimes(1);
  });

  it('Fail to Delete plugin should throw error', async () => {
    const testJsPluginFails = {
      name: 'testFails',
      museCore: {
        pm: {
          deletePlugin: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeDeletePlugin: jest.fn(),
          afterDeletePlugin: jest.fn(),
          failedDeletePlugin: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);

    const pluginName = 'test-plugin-fails';
    await muse.pm.createPlugin({ pluginName, author: 'gling' });
    const result = await muse.pm.getPlugin(pluginName);
    expect(result).toMatchObject({ name: pluginName, createdBy: 'gling', owners: ['gling'] });
    try {
      await muse.pm.deletePlugin({ pluginName, author: 'gling' });
    } catch (e) {
      expect(e.message).toEqual('Async error');
    }

    expect(testJsPluginFails.museCore.pm.deletePlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.beforeDeletePlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.failedDeletePlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.afterDeletePlugin).toBeCalledTimes(0);
  });
});
