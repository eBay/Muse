const path = require('path');
const fs = require('fs-extra');
const { vol } = require('memfs');
const muse = require('@ebay/muse-core');
const getDeps = require('./getDeps');

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
        '@ebay/muse-lib-react@1.2.16': [
          'js-plugin@1.1.0/plugin.js',
          'redux@4.2.1/es/redux.js',
          'react-router-dom@6.15.0/dist/index.js',
        ],
        '@ebay/muse-lib-antd@1.2.13': [
          'antd@5.6.3/es/index.js',
          '@ebay/muse-lib-antd@1.2.13/src/features/common/index.js',
        ],
      },
    };
    fs.outputJsonSync(
      path.join(defaultAssetStorageLocation, `/p/test-plugin/v1.0.0/dist/deps-manifest.json`),
      manifest,
    );
  });

  it('gets correct depending shared modules of a plugin', async () => {
    const deps = await getDeps(pluginName, '1.0.0');
    expect(deps).toEqual({
      '@ebay/muse-lib-react@1.2.16': {
        name: '@ebay/muse-lib-react',
        version: '1.2.16',
        modules: [
          'js-plugin@1.1.0/plugin.js',
          'redux@4.2.1/es/redux.js',
          'react-router-dom@6.15.0/dist/index.js',
        ],
      },
      '@ebay/muse-lib-antd@1.2.13': {
        name: '@ebay/muse-lib-antd',
        version: '1.2.13',
        modules: [
          'antd@5.6.3/es/index.js',
          '@ebay/muse-lib-antd@1.2.13/src/features/common/index.js',
        ],
      },
    });
  });
});
