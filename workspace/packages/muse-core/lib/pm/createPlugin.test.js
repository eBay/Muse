const { vol } = require('memfs');
const plugin = require('js-plugin');
const { getPluginId } = require('../utils');
const { registry } = require('../storage');
const muse = require('../');

jest.mock('fs');
jest.mock('fs/promises');

describe('Create plugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Create plugin should create the correct yaml file', async () => {
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
    const pluginName = 'test-plugin';
    await muse.pm.createPlugin({ pluginName, author: 'nate' });
    const result = await registry.getJsonByYaml(`/plugins/${getPluginId(pluginName)}.yaml`);
    expect(result).toMatchObject({
      name: pluginName,
      createdBy: 'nate',
      type: 'normal',
      owners: ['nate'],
    });

    expect(testJsPlugin.museCore.pm.createPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeCreatePlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterCreatePlugin).toBeCalledTimes(1);
  });

  it('It throws exception if plugin name exists.', async () => {
    const testJsPlugin1 = {
      name: 'test1',
      museCore: {
        pm: {
          createPlugin: jest.fn(),
          beforeCreatePlugin: jest.fn(),
          afterCreatePlugin: jest.fn(),
        },
      },
    };
    plugin.register(testJsPlugin1);
    const pluginName = 'test-plugin';
    await muse.pm.createPlugin({ pluginName, author: 'nate' });

    try {
      await muse.pm.createPlugin({ pluginName, author: 'nate' });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch('already exists');
    }
  });

  it('fail to Create plugin should throw error', async () => {
    const testJsPluginFails = {
      name: 'testFails',
      museCore: {
        pm: {
          createPlugin: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeCreatePlugin: jest.fn(),
          afterCreatePlugin: jest.fn(),
          failedCreatePlugin: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);
    const pluginName = 'test-plugini-fails';

    try {
      await muse.pm.createPlugin({ pluginName, author: 'nate' });
      expect(true).toBe(false); // above statement should throw error
    } catch (e) {
      expect(e?.message).toEqual('Async error');
    }

    expect(testJsPluginFails.museCore.pm.failedCreatePlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.createPlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.beforeCreatePlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.afterCreatePlugin).toBeCalledTimes(0);
  });
});
