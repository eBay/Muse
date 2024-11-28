const path = require('path');
const fs = require('fs-extra');
const { vol } = require('memfs');
const muse = require('@ebay/muse-core');
const getDuplicatedLibs = require('./getDuplicatedLibs');

const { defaultAssetStorageLocation } = muse.utils;

describe('basic tests', () => {
  const pluginName = 'test-plugin';
  const pluginName2 = 'test-plugin-2';

  beforeEach(async () => {
    vol.reset();

    await muse.pm.createPlugin({ pluginName });
    await muse.pm.releasePlugin({
      pluginName,
      version: '1.0.0',
    });

    await muse.pm.createPlugin({ pluginName: pluginName2 });
    await muse.pm.releasePlugin({
      pluginName: pluginName2,
      version: '1.0.0',
    });

    const manifest1 = {
      content: {
        '@ebay/pkg-1@1.0.0/src/m1.js': {},
        '@ebay/pkg-2@1.0.1/src/m1.js': {},
        'pkg-4@2.0.0/src/m1.js': {},
      },
    };
    fs.outputJsonSync(
      path.join(defaultAssetStorageLocation, `/p/test-plugin/v1.0.0/dist/lib-manifest.json`),
      manifest1,
    );

    const manifest2 = {
      content: {
        '@ebay/pkg-1@1.0.0/src/m1.js': {},
        '@ebay/pkg-3@1.0.1/src/m1.js': {},
        'pkg-5@2.0.0/src/m1.js': {},
      },
    };
    fs.outputJsonSync(
      path.join(defaultAssetStorageLocation, `/p/test-plugin-2/v1.0.0/dist/lib-manifest.json`),
      manifest2,
    );
  });

  it('gets correct duplicated pkgs', async () => {
    const libs = await getDuplicatedLibs([
      { name: pluginName, version: '1.0.0' },
      { name: pluginName2, version: '1.0.0' },
    ]);

    expect(libs).toEqual({
      '@ebay/pkg-1': [
        { name: 'test-plugin', version: ['1.0.0'] },
        { name: 'test-plugin-2', version: ['1.0.0'] },
      ],
    });
  });
});
