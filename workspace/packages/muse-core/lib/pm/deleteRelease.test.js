const { vol } = require('memfs');
const plugin = require('js-plugin');
const path = require('path');
const fs = require('fs-extra');
const { defaultAssetStorageLocation } = require('../utils');

const testJsPlugin = {
  name: 'test',
  museCore: {
    pm: {
      deleteRelease: jest.fn(),
      beforeDeleteRelease: jest.fn(),
      afterDeleteRelease: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

// Testing file system
const fsJson = {};
for (let i = 0; i < 110; i++) {
  fsJson[`./build/file${i}.js`] = String(i);
}

describe('Delete Release tests', () => {
  beforeEach(() => {
    vol.reset();
    vol.fromJSON(fsJson, process.cwd());
  });

  it('Delete release deleting also assets', async () => {
    const muse = require('../');
    const pluginName = 'test-plugin';
    const version = '1.0.0';

    await muse.pm.createPlugin({ pluginName });
    await muse.pm.releasePlugin({
      pluginName,
      version,
      author: 'nate',
      buildDir: path.join(process.cwd(), 'build'),
    });

    await muse.pm.deleteRelease({
      pluginName,
      version,
      author: 'nate',
      msg: 'Deleted Release',
    });

    expect(testJsPlugin.museCore.pm.beforeDeleteRelease).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.deleteRelease).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterDeleteRelease).toBeCalledTimes(1);

    const pid = muse.utils.getPluginId(pluginName);
    expect(
      fs.existsSync(path.join(defaultAssetStorageLocation, `/p/${pid}/v${version}/file99.js`)),
    ).toBe(false);
  });
});
