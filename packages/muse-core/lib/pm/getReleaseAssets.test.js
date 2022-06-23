const { vol } = require('memfs');
const plugin = require('js-plugin');
const path = require('path');
const muse = require('../');
const { getPluginId } = require('../utils');

const testJsPlugin = {
  name: 'test',
  museCore: {
    pm: {
      getReleaseAssets: jest.fn(),
      beforeGetReleaseAssets: jest.fn(),
      afterGetReleaseAssets: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

// Testing file system
const fsJson = {};
for (let i = 0; i < 3; i++) {
  fsJson[`./build/file${i}.js`] = JSON.stringify({
    name: `file${1}.js`,
    type: 'file',
    size: 10,
  });
}

describe('Get released plugin assets tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Get no assset if version not released', async () => {
    const pluginName = 'test-plugin';
    const pid = getPluginId(pluginName);
    const files = await muse.pm.getReleaseAssets({
      pluginName: pid,
      version: '1.0.1',
    });
    expect(files.length).toBe(0);
    expect(testJsPlugin.museCore.pm.getReleaseAssets).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeGetReleaseAssets).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterGetReleaseAssets).toBeCalledTimes(1);
  });

  it('Get released assets if assets were uploaded.', async () => {
    vol.fromJSON(fsJson, process.cwd());
    const pluginName = 'test-plugin';
    const version = '1.2.0';
    await muse.pm.createPlugin({ pluginName });
    await muse.pm.releasePlugin({
      pluginName,
      version,
      buildDir: path.join(process.cwd(), 'build'),
      author: 'gling',
    });

    const pid = getPluginId(pluginName);

    const files = await muse.pm.getReleaseAssets({
      pluginName: pid,
      version: '1.2.0',
    });
    expect(files.length).toBe(4);
    expect(testJsPlugin.museCore.pm.getReleaseAssets).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeGetReleaseAssets).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterGetReleaseAssets).toBeCalledTimes(1);
  });
});
