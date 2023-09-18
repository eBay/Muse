const path = require('path');
const fs = require('fs-extra');
const { vol } = require('memfs');
const muse = require('@ebay/muse-core');

const { defaultAssetStorageLocation } = muse.utils;

// const getLibDiff = require('./getLibDiff');

const fsJson = {};
for (let i = 0; i < 10; i++) {
  fsJson[`./build/file${i}.js`] = String(i);
}

describe('basic tests', () => {
  const pluginName = 'test-plugin';

  beforeEach(async () => {
    vol.reset();
    vol.fromJSON(fsJson, process.cwd());

    await muse.pm.createPlugin({ pluginName });
    await muse.pm.releasePlugin({
      pluginName,
      version: '1.0.0',
    });

    await muse.pm.releasePlugin({
      pluginName,
      version: '1.0.1',
    });

    fs.outputJsonSync(
      path.join(defaultAssetStorageLocation, `/p/test-plugin/v1.0.0/dist/lib-manifest.json`),
      {
        content: {
          '@ebay/muse-core@1.0.0': {},
        },
      },
    );
  });

  it('should get diff of shared modules between two versions of a lib plugin', async () => {});

  it('supports local folder', async () => {});
});
