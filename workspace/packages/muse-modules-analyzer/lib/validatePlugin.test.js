const path = require('path');
const fs = require('fs-extra');
const { vol } = require('memfs');
const muse = require('@ebay/muse-core');
const validatePlugin = require('./validatePlugin');

const { defaultAssetStorageLocation } = muse.utils;

describe('basic tests', () => {
  const libPluginName = 'test-lib-plugin';
  const normalPluginName = 'test-normal-plugin';

  beforeEach(async () => {
    vol.reset();

    await muse.pm.createPlugin({ pluginName: libPluginName });
    await muse.pm.createPlugin({ pluginName: normalPluginName });
    await muse.pm.releasePlugin({
      pluginName: libPluginName,
      version: '1.0.0',
    });

    await muse.pm.releasePlugin({
      pluginName: normalPluginName,
      version: '1.0.0',
    });

    await muse.pm.releasePlugin({
      pluginName: normalPluginName,
      version: '1.0.1',
    });

    fs.outputJsonSync(
      path.join(defaultAssetStorageLocation, `/p/${libPluginName}/v1.0.0/dist/lib-manifest.json`),
      {
        content: {
          '@ebay/pkg-1@1.0.0/src/m1.js': {},
          '@ebay/pkg-1@1.0.0/src/m2.js': {},
          '@ebay/pkg-2@1.0.0/src/m1.js': {},
          'pkg-4@1.0.0/src/m1.js': {},
        },
      },
    );
    fs.outputJsonSync(
      path.join(
        defaultAssetStorageLocation,
        `/p/${normalPluginName}/v1.0.0/dist/deps-manifest.json`,
      ),
      {
        content: {
          [`${libPluginName}@1.0.0`]: [
            '@ebay/pkg-1@1.0.0/src/m1.js',
            '@ebay/pkg-1@1.0.0/src/m0.js',
          ],
        },
      },
    );

    fs.outputJsonSync(
      path.join(
        defaultAssetStorageLocation,
        `/p/${normalPluginName}/v1.0.1/dist/deps-manifest.json`,
      ),
      {
        content: {
          [`${libPluginName}@1.0.0`]: [
            '@ebay/pkg-1@1.0.0/src/m1.js',
            '@ebay/pkg-2@1.0.0/src/m1.js',
          ],
        },
      },
    );
  });

  it('gets missing modules if they are missing', async () => {
    const result = await validatePlugin(normalPluginName, '1.0.0');
    expect(result.missingModules).toEqual([
      {
        module: '@ebay/pkg-1@1.0.0/src/m0.js',
        from: 'test-lib-plugin@1.0.0',
      },
    ]);
  });

  it('has no missing modules if everything is ok', async () => {
    const result = await validatePlugin(normalPluginName, '1.0.1');
    expect(result.missingModules).toEqual([]);
  });
});
