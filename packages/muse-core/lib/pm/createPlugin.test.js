const { vol } = require('memfs');
const plugin = require('js-plugin');
const { jsonByYamlBuff, getPluginId } = require('../utils');
const { registry } = require('../storage');
const muse = require('../');

jest.mock('fs');
jest.mock('fs/promises');

const testJsPlugin = {
  name: 'test',
  museCore: {
    pm: {
      createPlugin: jest.fn(),
      beforeCreatePlugin: jest.fn(),
      afterCreatePlugin: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Create plugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Create plugin should create the correct yaml file', async () => {
    const pluginName = 'test-plugin';
    await muse.pm.createPlugin({ pluginName, author: 'nate' });
    const result = jsonByYamlBuff(await registry.get(`/plugins/${getPluginId(pluginName)}.yaml`));
    expect(result).toMatchObject({ name: pluginName, createdBy: 'nate', type: 'normal', owners: ['nate'] });

    expect(testJsPlugin.museCore.pm.createPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeCreatePlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterCreatePlugin).toBeCalledTimes(1);
  });

  it('It throws exception if plugin name exists.', async () => {
    const pluginName = 'test-plugin';
    await muse.pm.createPlugin({ pluginName, author: 'nate' });

    try {
      await muse.pm.createPlugin({ pluginName, author: 'nate' });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch('already exists');
    }
  });
});
