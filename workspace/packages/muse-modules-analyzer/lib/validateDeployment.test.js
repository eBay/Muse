const path = require('path');
const fs = require('fs-extra');
const { vol } = require('memfs');
const muse = require('@ebay/muse-core');
const validateDeployment = require('./validateDeployment');

const { defaultAssetStorageLocation } = muse.utils;

describe('basic tests', () => {
  const appName = 'testapp';
  const libPluginName = 'test-lib-plugin';
  const libPluginName2 = 'test-lib-plugin-2';
  const normalPluginName = 'test-normal-plugin';
  const normalPluginName2 = 'test-normal-plugin-2';
  const bootPluginName = 'test-boot-plugin';
  const bootPluginName2 = 'test-boot-plugin-2';
  const initPluginName = 'test-init-plugin';
  const initPluginName2 = 'test-init-plugin-2';

  beforeEach(async () => {
    vol.reset();

    const plugins = [
      libPluginName,
      libPluginName2,
      normalPluginName,
      normalPluginName2,
      bootPluginName,
      bootPluginName2,
      initPluginName,
      initPluginName2,
    ];
    for (let pluginName of plugins) {
      let pluginType;
      if (pluginName.startsWith('lib')) pluginType = 'lib';
      else if (pluginName.startsWith('boot')) pluginType = 'boot';
      else if (pluginName.startsWith('init')) pluginType = 'init';
      else pluginType = 'normal';
      await muse.pm.createPlugin({ pluginName, type: pluginType });
      await muse.pm.releasePlugin({
        pluginName,
        version: '1.0.0',
      });

      await muse.pm.releasePlugin({
        pluginName,
        version: '1.0.1',
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
          'pkg-4@1.0.0/src/m1.js': {},
        },
      },
    );

    fs.outputJsonSync(
      path.join(
        defaultAssetStorageLocation,
        `/p/${normalPluginName2}/v1.0.0/dist/deps-manifest.json`,
      ),
      {
        content: {
          [`${libPluginName}@1.0.0`]: ['@ebay/pkg-1@1.0.0/src/m1.js', 'pkg-4@1.0.0/src/m1.js'],
          'unknow-lib-plugin@1.0.0': ['somepkg@1.0.0/src/m1.js'],
        },
      },
    );
  });

  it('validates one plugin deployment', async () => {
    await validateDeployment(appName, 'staging', []);
    const result = await validateDeployment(appName, 'staging', [
      {
        pluginName: normalPluginName2,
        version: '1.0.0',
      },
    ]);
    console.log(result.dist);
  });
  it('validates multiple plugins(lib, normal) deployment', async () => {});
  it('validates one plugin undeployment', async () => {});
  it('validates mixed deployment and undeployment', async () => {});
  it('validates multiple boot plugins deployment', async () => {});
  it('validate no boot plugin deployment', async () => {});
  it('is always passed when deploy/undeploy init plugins', async () => {});
});
