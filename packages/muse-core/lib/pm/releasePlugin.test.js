const path = require('path');
const { vol } = require('memfs');
const fs = require('fs-extra');
const plugin = require('js-plugin');
const { defaultAssetStorage } = require('../utils');

const testReleasePlugin = {
  name: 'test',
  museCore: {
    pm: {
      beforeReleasePlugin: jest.fn(),
      releasePlugin: jest.fn(),
      afterReleasePlugin: jest.fn(),
    },
  },
};

plugin.register(testReleasePlugin);

// Testing file system
const fsJson = {};
for (let i = 0; i < 110; i++) {
  fsJson[`./build/file${i}.js`] = String(i);
}

describe('release plugin basic tests.', () => {
  beforeAll(async () => {
    // create a mock muse config
  });

  beforeEach(() => {
    vol.reset();
    vol.fromJSON(fsJson, process.cwd());
  });

  it('It create a release without build dir', async () => {
    const muse = require('../');
    const pluginName = 'test-plugin';

    await muse.pm.createPlugin({ pluginName });
    await muse.pm.releasePlugin({
      pluginName,
      version: 'patch',
      author: 'nate',
    });

    await muse.pm.releasePlugin({
      pluginName,
      version: 'minor',
      author: 'nate',
    });

    const releases = await muse.pm.getReleases(pluginName);
    expect(releases[0]).toMatchObject({ version: '1.1.0', createdBy: 'nate' });
    expect(releases[1]).toMatchObject({ version: '1.0.0', createdBy: 'nate' });

    expect(testReleasePlugin.museCore.pm.beforeReleasePlugin).toBeCalledTimes(2);
    expect(testReleasePlugin.museCore.pm.releasePlugin).toBeCalledTimes(2);
    expect(testReleasePlugin.museCore.pm.afterReleasePlugin).toBeCalledTimes(2);
  });

  it('It uploads assets to storage if buildDir is provided.', async () => {
    const muse = require('../');
    const pluginName = 'test-plugin';
    const version = '1.0.2';
    await muse.pm.createPlugin({ pluginName });
    await muse.pm.releasePlugin({
      pluginName,
      version,
      buildDir: path.join(process.cwd(), 'build'),
      author: 'nate',
    });

    const releases = await muse.pm.getReleases(pluginName);
    expect(releases[0]).toMatchObject({ version: '1.0.2', author: 'nate' });

    const pid = muse.utils.getPluginId(pluginName);
    expect(fs.readFileSync(path.join(defaultAssetStorage, `/p/${pid}/v${version}/file99.js`)).toString()).toBe('99');
  });
});
