const path = require('path');
const fs = require('fs-extra');
const { vol } = require('memfs');
const muse = require('@ebay/muse-core');
const getLibs = require('./getLibs');

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
        '@ebay/pkg-1@1.0.0/src/m2.js': {},
        '@ebay/pkg-2@1.0.0/src/m1.js': {},
        'pkg-4@1.0.0/src/m1.js': {},
      },
    };
    fs.outputJsonSync(
      path.join(defaultAssetStorageLocation, `/p/test-plugin/v1.0.0/dist/lib-manifest.json`),
      manifest,
    );
    fs.outputJsonSync('./build/dist/lib-manifest.json', manifest);
  });

  it('gets correct shared packages and modules of a lib plugin', async () => {
    const libs = await getLibs(pluginName, '1.0.0');
    expect(libs).toEqual({
      pluginName: 'test-plugin',
      packages: {
        '@ebay/pkg-1': {
          version: ['1.0.0'],
          modules: ['/src/m1.js', '/src/m2.js'],
        },
        '@ebay/pkg-2': {
          version: ['1.0.0'],
          modules: ['/src/m1.js'],
        },
        'pkg-4': {
          version: ['1.0.0'],
          modules: ['/src/m1.js'],
        },
      },
      byId: {
        '@ebay/pkg-1@1.0.0/src/m1.js': {},
        '@ebay/pkg-1@1.0.0/src/m2.js': {},
        '@ebay/pkg-2@1.0.0/src/m1.js': {},
        'pkg-4@1.0.0/src/m1.js': {},
      },
    });
  });
});
