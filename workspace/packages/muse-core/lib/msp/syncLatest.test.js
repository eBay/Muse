const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');
const { registry } = require('../storage');

jest.mock('download');
const download = require('download');

const MSP_YAML = `
default:
  versions:
    "@ebay/muse-core": "1.0.45"
    "@ebay/muse-cli": "1.0.34"
muse-react:
  extends: default
  versions:
    "@ebay/muse-lib-react": "1.3.2"
`;

const testJsPlugin = {
  name: 'test-syncLatest',
  museCore: {
    msp: {
      syncLatest: jest.fn(),
      beforeSyncLatest: jest.fn(),
      afterSyncLatest: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('syncLatest tests.', () => {
  beforeEach(() => {
    vol.reset();
    jest.clearAllMocks();
  });

  it('should fetch latest versions and update msp', async () => {
    await registry.set('/msp.yaml', MSP_YAML);

    download.mockImplementation((url) => {
      const versions = {
        '@ebay/muse-core': '1.0.46',
        '@ebay/muse-cli': '1.0.35',
        '@ebay/muse-lib-react': '1.3.3',
      };
      const pkg = Object.keys(versions).find((p) => url.includes(p));
      return Promise.resolve(Buffer.from(JSON.stringify({ version: versions[pkg] })));
    });

    const result = await muse.msp.syncLatest({ author: 'nate' });

    expect(result.default.versions['@ebay/muse-core']).toBe('1.0.46');
    expect(result.default.versions['@ebay/muse-cli']).toBe('1.0.35');
    expect(result['muse-react'].versions['@ebay/muse-lib-react']).toBe('1.3.3');

    expect(testJsPlugin.museCore.msp.syncLatest).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.msp.beforeSyncLatest).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.msp.afterSyncLatest).toBeCalledTimes(1);
  });

  it('should use default registry url', async () => {
    await registry.set('/msp.yaml', MSP_YAML);
    download.mockResolvedValue(Buffer.from(JSON.stringify({ version: '1.0.46' })));

    await muse.msp.syncLatest({ author: 'nate' });

    expect(download).toHaveBeenCalledWith(
      expect.stringContaining('https://registry.npmjs.org/'),
    );
  });

  it('should use custom registry url', async () => {
    await registry.set('/msp.yaml', MSP_YAML);
    download.mockResolvedValue(Buffer.from(JSON.stringify({ version: '1.0.46' })));

    await muse.msp.syncLatest({ registry: 'https://my.registry.com', author: 'nate' });

    expect(download).toHaveBeenCalledWith(
      expect.stringContaining('https://my.registry.com/'),
    );
    expect(download).not.toHaveBeenCalledWith(
      expect.stringContaining('registry.npmjs.org'),
    );
  });

  it('should skip package and continue when registry fetch fails for it', async () => {
    await registry.set('/msp.yaml', MSP_YAML);

    download.mockImplementation((url) => {
      if (url.includes('@ebay/muse-core')) {
        return Promise.reject(new Error('network error'));
      }
      return Promise.resolve(Buffer.from(JSON.stringify({ version: '1.0.35' })));
    });

    const result = await muse.msp.syncLatest({ author: 'nate' });

    // muse-core failed, stays unchanged
    expect(result.default.versions['@ebay/muse-core']).toBe('1.0.45');
    // others still updated
    expect(result.default.versions['@ebay/muse-cli']).toBe('1.0.35');
  });

  it('should throw if msp.yaml does not exist', async () => {
    try {
      await muse.msp.syncLatest({ author: 'nate' });
      expect(true).toBe(false);
    } catch (err) {
      expect(err.message).toMatch('msp.yaml does not exist');
    }
  });

  it('should throw and invoke failedSyncLatest on error', async () => {
    const testJsPluginFails = {
      name: 'test-syncLatest-fail',
      museCore: {
        msp: {
          syncLatest: jest.fn().mockRejectedValue(new Error('ext error')),
          beforeSyncLatest: jest.fn(),
          afterSyncLatest: jest.fn(),
          failedSyncLatest: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);

    await registry.set('/msp.yaml', MSP_YAML);
    download.mockResolvedValue(Buffer.from(JSON.stringify({ version: '1.0.46' })));

    try {
      await muse.msp.syncLatest({ author: 'nate' });
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toEqual('ext error');
    }
    expect(testJsPluginFails.museCore.msp.failedSyncLatest).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.msp.afterSyncLatest).toBeCalledTimes(0);
  });
});
