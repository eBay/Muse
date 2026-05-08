const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');
const { registry } = require('../storage');

const testJsPlugin = {
  name: 'test-updatePackages',
  museCore: {
    msp: {
      updatePackages: jest.fn(),
      beforeUpdatePackages: jest.fn(),
      afterUpdatePackages: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

const MSP_YAML = `
default:
  versions:
    "@ebay/muse-core": "1.0.45"
    "@ebay/muse-lib-react": "1.3.2"
muse-react:
  extends: default
  versions:
    "@ebay/muse-lib-react": "2.0.3"
`;

describe('updatePackages tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('should update matching package versions across all presets', async () => {
    await registry.set('/msp.yaml', MSP_YAML);

    await muse.msp.updatePackages({
      pkgs: { '@ebay/muse-core': { version: '1.0.46' } },
      author: 'nate',
    });

    const msp = await registry.getJsonByYaml('/msp.yaml');
    expect(msp.default.versions['@ebay/muse-core']).toBe('1.0.46');

    expect(testJsPlugin.museCore.msp.updatePackages).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.msp.beforeUpdatePackages).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.msp.afterUpdatePackages).toBeCalledTimes(1);
  });

  it('should not update when major version differs', async () => {
    await registry.set('/msp.yaml', MSP_YAML);

    await muse.msp.updatePackages({
      pkgs: { '@ebay/muse-core': { version: '2.0.0' } },
      author: 'nate',
    });

    const msp = await registry.getJsonByYaml('/msp.yaml');
    expect(msp.default.versions['@ebay/muse-core']).toBe('1.0.45');
  });

  it('should skip pre-release versions by default', async () => {
    await registry.set('/msp.yaml', MSP_YAML);

    await muse.msp.updatePackages({
      pkgs: { '@ebay/muse-core': { version: '1.0.46-beta.1' } },
      author: 'nate',
    });

    const msp = await registry.getJsonByYaml('/msp.yaml');
    expect(msp.default.versions['@ebay/muse-core']).toBe('1.0.45');
  });

  it('should apply pre-release when allowPreRelease is true', async () => {
    await registry.set('/msp.yaml', MSP_YAML);

    await muse.msp.updatePackages({
      pkgs: { '@ebay/muse-core': { version: '1.0.46-beta.1', allowPreRelease: true } },
      author: 'nate',
    });

    const msp = await registry.getJsonByYaml('/msp.yaml');
    expect(msp.default.versions['@ebay/muse-core']).toBe('1.0.46-beta.1');
  });

  it('should skip packages not present in a preset', async () => {
    await registry.set('/msp.yaml', MSP_YAML);

    await muse.msp.updatePackages({
      pkgs: { '@ebay/muse-cli': { version: '1.0.35' } },
      author: 'nate',
    });

    const msp = await registry.getJsonByYaml('/msp.yaml');
    expect(msp.default.versions['@ebay/muse-cli']).toBeUndefined();
  });

  it('should update same package independently in each preset', async () => {
    await registry.set('/msp.yaml', MSP_YAML);

    await muse.msp.updatePackages({
      pkgs: { '@ebay/muse-lib-react': { version: '1.3.9' } },
      author: 'nate',
    });

    const msp = await registry.getJsonByYaml('/msp.yaml');
    // default has 1.x — updated
    expect(msp.default.versions['@ebay/muse-lib-react']).toBe('1.3.9');
    // muse-react has 2.x — major differs, not updated
    expect(msp['muse-react'].versions['@ebay/muse-lib-react']).toBe('2.0.3');
  });

  it('should throw if msp.yaml does not exist', async () => {
    try {
      await muse.msp.updatePackages({ pkgs: {}, author: 'nate' });
      expect(true).toBe(false);
    } catch (err) {
      expect(err.message).toMatch('msp.yaml does not exist');
    }
  });

  it('should throw and invoke failedUpdatePackages on error', async () => {
    const testJsPluginFails = {
      name: 'test-updatePackages-fail',
      museCore: {
        msp: {
          updatePackages: jest.fn().mockRejectedValue(new Error('storage error')),
          beforeUpdatePackages: jest.fn(),
          afterUpdatePackages: jest.fn(),
          failedUpdatePackages: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);
    await registry.set('/msp.yaml', MSP_YAML);

    try {
      await muse.msp.updatePackages({ pkgs: {}, author: 'nate' });
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toEqual('storage error');
    }
    expect(testJsPluginFails.museCore.msp.failedUpdatePackages).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.msp.afterUpdatePackages).toBeCalledTimes(0);
  });
});
