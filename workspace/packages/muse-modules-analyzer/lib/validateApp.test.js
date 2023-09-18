const path = require('path');
const fs = require('fs-extra');
const { vol } = require('memfs');
const muse = require('@ebay/muse-core');
const validateApp = require('./validateApp');

const { defaultAssetStorageLocation } = muse.utils;

describe('basic tests', () => {
  const appName = 'testapp';
  const libPluginName = 'test-lib-plugin';
  const normalPluginName = 'test-normal-plugin';
  const bootPluginName = 'test-boot-plugin';
  const initPluginName = 'test-init-plugin';

  beforeEach(async () => {
    vol.reset();

    const plugins = [libPluginName, normalPluginName, bootPluginName, initPluginName];
    for (let pluginName of plugins) {
      let pluginType;
      if (pluginName.includes('-lib-')) pluginType = 'lib';
      else if (pluginName.includes('-boot-')) pluginType = 'boot';
      else if (pluginName.includes('-init-')) pluginType = 'init';
      else pluginType = 'normal';

      await muse.pm.createPlugin({ pluginName, type: pluginType });
      await muse.pm.releasePlugin({
        pluginName,
        version: '1.0.0',
      });
    }

    await muse.am.createApp({
      appName,
    });
    await muse.pm.deployPlugin({
      appName,
      envMap: {
        staging: [
          { pluginName: bootPluginName, version: '1.0.0', type: 'add' },
          { pluginName: initPluginName, version: '1.0.0', type: 'add' },
          { pluginName: libPluginName, version: '1.0.0', type: 'add' },
          { pluginName: normalPluginName, version: '1.0.0', type: 'add' },
        ],
      },
    });

    fs.outputJsonSync(
      path.join(defaultAssetStorageLocation, `/p/${libPluginName}/v1.0.0/dist/lib-manifest.json`),
      {
        content: {
          '@ebay/pkg-1@1.0.0/src/m1.js': {},
          '@ebay/pkg-1@1.0.0/src/m2.js': {},
          '@ebay/pkg-2@1.0.0/src/m1.js': {},
          '@ebay/pkg-3@1.0.0/m1.js': {},
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
          [`${libPluginName}@1.0.0`]: ['@ebay/pkg-1@1.0.0/src/m1.js', 'pkg-4@1.0.0/src/m1.js'],
        },
      },
    );
  });

  it('validates one plugin deployment', async () => {
    const result = await validateApp(appName, 'staging');
    expect(result.dist.missingModules).toEqual([]);
  });
});
