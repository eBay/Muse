const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');
const { registry } = require('../storage');

const testJsPlugin = {
  name: 'test-deletePreset',
  museCore: {
    msp: {
      deletePreset: jest.fn(),
      beforeDeletePreset: jest.fn(),
      afterDeletePreset: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('deletePreset tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('should delete a preset from msp.yaml', async () => {
    await registry.set(
      '/msp.yaml',
      `
default:
  versions:
    "@ebay/muse-core": "1.0.45"
muse-react:
  extends: default
  versions:
    "@ebay/muse-lib-react": "2.0.3"
`,
    );

    await muse.msp.deletePreset({ name: 'muse-react', author: 'nate' });

    const msp = await registry.getJsonByYaml('/msp.yaml');
    expect(msp['muse-react']).toBeUndefined();
    expect(msp.default).toBeDefined();

    expect(testJsPlugin.museCore.msp.deletePreset).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.msp.beforeDeletePreset).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.msp.afterDeletePreset).toBeCalledTimes(1);
  });

  it('should throw if msp.yaml does not exist', async () => {
    try {
      await muse.msp.deletePreset({ name: 'default', author: 'nate' });
      expect(true).toBe(false);
    } catch (err) {
      expect(err.message).toMatch('msp.yaml does not exist');
    }
  });

  it('should throw if preset does not exist', async () => {
    await registry.set('/msp.yaml', 'default:\n  versions: {}\n');

    try {
      await muse.msp.deletePreset({ name: 'no-such-preset', author: 'nate' });
      expect(true).toBe(false);
    } catch (err) {
      expect(err.message).toMatch('does not exist');
    }
  });

  it('should throw and invoke failedDeletePreset on error', async () => {
    const testJsPluginFails = {
      name: 'test-deletePreset-fail',
      museCore: {
        msp: {
          deletePreset: jest.fn().mockRejectedValue(new Error('storage error')),
          beforeDeletePreset: jest.fn(),
          afterDeletePreset: jest.fn(),
          failedDeletePreset: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);
    await registry.set('/msp.yaml', 'default:\n  versions: {}\n');

    try {
      await muse.msp.deletePreset({ name: 'default', author: 'nate' });
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toEqual('storage error');
    }
    expect(testJsPluginFails.museCore.msp.failedDeletePreset).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.msp.afterDeletePreset).toBeCalledTimes(0);
  });
});
