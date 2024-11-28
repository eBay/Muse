const path = require('path');
const fs = require('fs-extra');
const { vol } = require('memfs');
const muse = require('@ebay/muse-core');
const getLibVersion = require('./getLibVersion');

const { defaultAssetStorageLocation } = muse.utils;

describe('basic tests', () => {
  const pluginName = 'test-plugin';

  beforeEach(async () => {
    vol.reset();

    await muse.pm.createPlugin({ pluginName });
    await muse.pm.releasePlugin({
      pluginName,
      version: '1.0.0',
    });

    const manifest = {
      content: {
        '@ebay/pkg-1@1.0.0/src/m1.js': {},
        '@ebay/pkg-2@1.0.1/src/m1.js': {},
        'pkg-4@2.0.0/src/m1.js': {},
      },
    };
    fs.outputJsonSync(
      path.join(defaultAssetStorageLocation, `/p/test-plugin/v1.0.0/dist/lib-manifest.json`),
      manifest,
    );
    fs.outputJsonSync('./build/dist/lib-manifest.json', manifest);
  });

  it('gets correct version of a sharaed package in a lib plugin', async () => {
    const ver1 = await getLibVersion(pluginName, '1.0.0', '@ebay/pkg-1');
    expect(ver1).toEqual(['1.0.0']);
    const ver2 = await getLibVersion(pluginName, '1.0.0', '@ebay/pkg-2');
    expect(ver2).toEqual(['1.0.1']);
    const ver3 = await getLibVersion(pluginName, '1.0.0', 'pkg-4');
    expect(ver3).toEqual(['2.0.0']);
  });

  it('supports local folder', async () => {
    const ver1 = await getLibVersion(pluginName, './build', '@ebay/pkg-1');
    expect(ver1).toEqual(['1.0.0']);
    const ver2 = await getLibVersion(pluginName, './build', '@ebay/pkg-2');
    expect(ver2).toEqual(['1.0.1']);
    const ver3 = await getLibVersion(pluginName, './build', 'pkg-4');
    expect(ver3).toEqual(['2.0.0']);
  });
});
