const path = require('path');
const fs = require('fs-extra');
const { vol } = require('memfs');
const muse = require('@ebay/muse-core');
const { validateDeployment } = require('./');

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
      if (pluginName.includes('-lib-')) pluginType = 'lib';
      else if (pluginName.includes('-boot-')) pluginType = 'boot';
      else if (pluginName.includes('-init-')) pluginType = 'init';
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
          '@ebay/pkg-3@1.0.0/m1.js': {},
          'pkg-4@1.0.0/src/m1.js': {},
        },
      },
    );

    fs.outputJsonSync(
      path.join(defaultAssetStorageLocation, `/p/${libPluginName2}/v1.0.0/dist/lib-manifest.json`),
      {
        content: {
          'somepkg@1.0.0/src/m1.js': {},
          '@ebay/pkg-1@1.0.0/src/m1.js': {},
          '@ebay/pkg-2@1.0.0/src/m1.js': {},
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
          [`${libPluginName}@1.0.0`]: ['@ebay/pkg-2@1.0.0/src/m1.js', 'pkg-4@1.0.0/src/m1.js'],
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
          'some-lib-plugin@1.0.0': ['somepkg@1.0.0/src/m1.js'],
        },
      },
    );
  });

  it('validates one plugin deployment with missing modules', async () => {
    // normal plugin 2 has a missing module from lib plugin 2
    const result = await validateDeployment(appName, 'staging', [
      {
        pluginName: normalPluginName2,
        version: '1.0.0',
      },
    ]);
    expect(result.success).toBe(false);
    expect(result.dist.missingModules).toEqual([
      {
        plugin: 'test-normal-plugin-2',
        version: '1.0.0',
        sharedFrom: 'some-lib-plugin@1.0.0',
        moduleId: 'somepkg@1.0.0/src/m1.js',
      },
    ]);
  });
  it('validates multiple plugins(lib, normal) deployment', async () => {
    // normal plugin 2 can be deployed together with lib plugin 2 together
    const result = await validateDeployment(appName, 'staging', [
      {
        pluginName: normalPluginName2,
        version: '1.0.0',
      },
      {
        pluginName: libPluginName2,
        version: '1.0.0',
      },
    ]);
    expect(result.success).toBe(true);
    expect(result.dist.missingModules).toEqual([]);
  });
  it('validates one normal plugin undeployment', async () => {
    // normal plugin 1 can be undeployed
    const result = await validateDeployment(appName, 'staging', [
      {
        pluginName: normalPluginName,
        version: '1.0.0',
        type: 'remove',
      },
    ]);
    expect(result.success).toBe(true);
    expect(result.dist.missingModules).toEqual([]);
  });

  it('validates one lib plugin undeployment', async () => {
    // undeploy lib plugin will cause missing modules
    const result = await validateDeployment(appName, 'staging', [
      {
        pluginName: libPluginName,
        version: '1.0.0',
        type: 'remove',
      },
    ]);
    expect(result.success).toBe(false);

    expect(result.dist.missingModules).toEqual([
      {
        plugin: 'test-normal-plugin',
        version: '1.0.0',
        sharedFrom: 'test-lib-plugin@1.0.0',
        moduleId: '@ebay/pkg-2@1.0.0/src/m1.js',
      },
      {
        plugin: 'test-normal-plugin',
        version: '1.0.0',
        sharedFrom: 'test-lib-plugin@1.0.0',
        moduleId: 'pkg-4@1.0.0/src/m1.js',
      },
    ]);
  });
  it('validates mixed deployment and undeployment', async () => {
    const result = await validateDeployment(appName, 'staging', [
      {
        pluginName: libPluginName2,
        version: '1.0.0',
        type: 'add',
      },
      {
        pluginName: libPluginName,
        version: '1.0.0',
        type: 'remove',
      },
    ]);
    expect(result.success).toBe(false);
    expect(result.dist.missingModules).toEqual([
      {
        plugin: 'test-normal-plugin',
        version: '1.0.0',
        sharedFrom: 'test-lib-plugin@1.0.0',
        moduleId: 'pkg-4@1.0.0/src/m1.js',
      },
    ]);
  });
  it('validates multiple boot plugins deployment', async () => {
    const result = await validateDeployment(appName, 'staging', [
      {
        pluginName: bootPluginName2,
        version: '1.0.0',
        type: 'add',
      },
    ]);
    expect(result.success).toBe(false);
    expect(result.dist.multipleBootPlugins).toEqual([bootPluginName, bootPluginName2]);
  });
  it('validate no boot plugin deployment', async () => {
    const result = await validateDeployment(appName, 'staging', [
      {
        pluginName: bootPluginName,
        version: '1.0.0',
        type: 'remove',
      },
    ]);

    expect(result.success).toBe(false);
    expect(result.dist.missingBootPlugin).toBe(true);
  });
  it('is always passed when deploy/undeploy init plugins', async () => {
    const result = await validateDeployment(appName, 'staging', [
      {
        pluginName: initPluginName,
        version: '1.0.0',
        type: 'remove',
      },
      {
        pluginName: initPluginName2,
        version: '1.0.0',
        type: 'add',
      },
    ]);
    expect(result.success).toBe(true);
  });
});
