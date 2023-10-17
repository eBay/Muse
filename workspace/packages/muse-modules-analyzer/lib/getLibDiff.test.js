const path = require('path');
const fs = require('fs-extra');
const { vol } = require('memfs');
const muse = require('@ebay/muse-core');
const getLibDiff = require('./getLibDiff');

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

    await muse.pm.releasePlugin({
      pluginName,
      version: '1.0.1',
    });

    const manifest1 = {
      content: {
        '@ebay/pkg-1@1.0.0/src/m1.js': {},
        '@ebay/pkg-1@1.0.0/src/m2.js': {},
        '@ebay/pkg-2@1.0.0/src/m1.js': {},
        'pkg-4@1.0.0/src/m1.js': {},
      },
    };
    fs.outputJsonSync(
      path.join(defaultAssetStorageLocation, `/p/test-plugin/v1.0.0/dist/lib-manifest.json`),
      manifest1,
    );
    fs.outputJsonSync('./build/dist/lib-manifest.json', manifest1);

    const manifest2 = {
      content: {
        '@ebay/pkg-1@1.0.0/src/m1.js': {},
        '@ebay/pkg-1@1.0.0/src/m3.js': {},
        '@ebay/pkg-3@1.0.0/src/m3.js': {},
        'pkg-4@1.0.1/src/m1.js': {},
      },
    };
    fs.outputJsonSync(
      path.join(defaultAssetStorageLocation, `/p/test-plugin/v1.0.1/dist/lib-manifest.json`),
      manifest2,
    );
    fs.outputJsonSync('./build2/dist/lib-manifest.json', manifest2);
  });

  it('gets modules diff of two versions of a lib plugin', async () => {
    const diff = await getLibDiff(pluginName, '1.0.0', '1.0.1', 'dist');
    expect(diff.removedIds).toEqual(['@ebay/pkg-1@1.0.0/src/m2.js']);
    expect(diff.addedIds).toEqual(['@ebay/pkg-1@1.0.0/src/m3.js']);
    expect(diff.removedPkgs).toEqual({ '@ebay/pkg-2': '1.0.0' });
    expect(diff.addedPkgs).toEqual({ '@ebay/pkg-3': '1.0.0' });
    expect(diff.updatedPkgs).toEqual({ 'pkg-4': { from: '1.0.0', to: '1.0.1' } });
  });

  it('supports local folder', async () => {
    const diff = await getLibDiff(pluginName, './build', './build2', 'dist');
    expect(diff.removedIds).toEqual(['@ebay/pkg-1@1.0.0/src/m2.js']);
    expect(diff.addedIds).toEqual(['@ebay/pkg-1@1.0.0/src/m3.js']);
    expect(diff.removedPkgs).toEqual({ '@ebay/pkg-2': '1.0.0' });
    expect(diff.addedPkgs).toEqual({ '@ebay/pkg-3': '1.0.0' });
    expect(diff.updatedPkgs).toEqual({ 'pkg-4': { from: '1.0.0', to: '1.0.1' } });
  });
});
