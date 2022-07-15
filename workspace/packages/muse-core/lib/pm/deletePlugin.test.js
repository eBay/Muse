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
});
