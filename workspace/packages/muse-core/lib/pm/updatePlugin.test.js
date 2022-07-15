const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    pm: {
      updatePlugin: jest.fn(),
      beforeUpdatePlugin: jest.fn(),
      afterUpdatePlugin: jest.fn(),
      failedUpdatePlugin: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Update plugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('Update plugin should work', async () => {
    const pluginName = 'plugin1';
    await muse.pm.createPlugin({ pluginName, author: 'nate' });
    await muse.pm.updatePlugin({
      pluginName,
      changes: {
        set: {
          path: 'author',
          value: 'mister-x',
        },
      },
    });
    const plugin = await muse.pm.getPlugin(pluginName);
    expect(plugin.author).toBe('mister-x');
    expect(testJsPlugin.museCore.pm.updatePlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeUpdatePlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterUpdatePlugin).toBeCalledTimes(1);
  });

  it('It throws exception if plugin does not exist.', async () => {
    const pluginName = 'testplugin-dont-exist';

    try {
      await muse.pm.updatePlugin({ pluginName });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`doesn't exist`);
    }
  });
});
