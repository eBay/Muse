const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');
const { registry } = require('../storage');

const testJsPlugin = {
  name: 'test-addPreset',
  museCore: {
    msp: {
      addPreset: jest.fn(),
      beforeAddPreset: jest.fn(),
      afterAddPreset: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('addPreset tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('should create msp.yaml and add preset when file does not exist', async () => {
    const preset = await muse.msp.addPreset({
      name: 'default',
      preset: { versions: { '@ebay/muse-core': '1.0.45' } },
      author: 'nate',
    });

    expect(preset).toMatchObject({ versions: { '@ebay/muse-core': '1.0.45' } });
    expect(preset.creation).toBeDefined();

    const msp = await registry.getJsonByYaml('/msp.yaml');
    expect(msp.default).toMatchObject({ versions: { '@ebay/muse-core': '1.0.45' } });

    expect(testJsPlugin.museCore.msp.addPreset).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.msp.beforeAddPreset).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.msp.afterAddPreset).toBeCalledTimes(1);
  });

  it('should add preset to existing msp.yaml', async () => {
    await registry.set('/msp.yaml', 'default:\n  versions:\n    "@ebay/muse-core": "1.0.45"\n');

    await muse.msp.addPreset({
      name: 'muse-react',
      preset: { extends: 'default', versions: { '@ebay/muse-lib-react': '2.0.3' } },
      author: 'nate',
    });

    const msp = await registry.getJsonByYaml('/msp.yaml');
    expect(Object.keys(msp)).toEqual(['muse-react', 'default']);
    expect(msp['muse-react'].extends).toBe('default');
  });

  it('should throw if preset already exists', async () => {
    await registry.set('/msp.yaml', 'default:\n  versions: {}\n');

    try {
      await muse.msp.addPreset({ name: 'default', preset: {}, author: 'nate' });
      expect(true).toBe(false);
    } catch (err) {
      expect(err.message).toMatch('already exists');
    }
  });

  it('should throw and invoke failedAddPreset on error', async () => {
    const testJsPluginFails = {
      name: 'test-addPreset-fail',
      museCore: {
        msp: {
          addPreset: jest.fn().mockRejectedValue(new Error('storage error')),
          beforeAddPreset: jest.fn(),
          afterAddPreset: jest.fn(),
          failedAddPreset: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);

    try {
      await muse.msp.addPreset({ name: 'new-preset', preset: {}, author: 'nate' });
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toEqual('storage error');
    }
    expect(testJsPluginFails.museCore.msp.failedAddPreset).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.msp.afterAddPreset).toBeCalledTimes(0);
  });
});
