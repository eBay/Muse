const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');
const { registry } = require('../storage');

const testJsPlugin = {
  name: 'test-getMsp',
  museCore: {
    msp: {
      getMsp: jest.fn(),
      beforeGetMsp: jest.fn(),
      afterGetMsp: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('getMsp tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('should return null when msp.yaml does not exist', async () => {
    const result = await muse.msp.getMsp();
    expect(result).toBeNull();
  });

  it('should return parsed msp.yaml as json', async () => {
    await registry.set(
      '/msp.yaml',
      `
default:
  description: Base preset
  versions:
    "@ebay/muse-core": "1.0.45"
`,
    );
    const result = await muse.msp.getMsp();
    expect(result).toMatchObject({
      default: { description: 'Base preset', versions: { '@ebay/muse-core': '1.0.45' } },
    });
    expect(testJsPlugin.museCore.msp.getMsp).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.msp.beforeGetMsp).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.msp.afterGetMsp).toBeCalledTimes(1);
  });

  it('should throw and invoke failedGetMsp on error', async () => {
    const testJsPluginFails = {
      name: 'test-getMsp-fail',
      museCore: {
        msp: {
          getMsp: jest.fn().mockRejectedValue(new Error('storage error')),
          beforeGetMsp: jest.fn(),
          afterGetMsp: jest.fn(),
          failedGetMsp: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);

    await registry.set('/msp.yaml', 'default:\n  versions: {}\n');

    try {
      await muse.msp.getMsp();
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toEqual('storage error');
    }
    expect(testJsPluginFails.museCore.msp.failedGetMsp).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.msp.afterGetMsp).toBeCalledTimes(0);
  });
});
