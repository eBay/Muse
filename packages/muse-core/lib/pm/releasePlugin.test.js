const path = require('path');
const { vol } = require('memfs');
const fs = require('fs-extra');
const plugin = require('js-plugin');
const { defaultAssetStorage } = require('../utils');

jest.mock('fs');
jest.mock('fs/promises');

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
const fsJson = {
  './build/info.json': JSON.stringify({ size: 100 }),
};
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

  it('releasePlugin basic tests', async () => {
    const muse = require('../');
    const pluginName = 'test-plugin';
    const version = '1.0.1';
    await muse.pm.createPlugin({ pluginName });
    await muse.pm.releasePlugin({
      pluginName,
      version,
      buildDir: path.join(process.cwd(), 'build'),
      author: 'nate',
    });

    const releases = await muse.pm.getReleases(pluginName);
    expect(releases.releases[0]).toMatchObject({ version: '1.0.1', author: 'nate', info: { size: 100 } });

    const pid = muse.utils.getPluginId(pluginName);
    expect(fs.readFileSync(path.join(defaultAssetStorage, `/p/${pid}/v${version}/file99.js`)).toString()).toBe('99');

    expect(testReleasePlugin.museCore.pm.beforeReleasePlugin).toBeCalledTimes(1);
    expect(testReleasePlugin.museCore.pm.releasePlugin).toBeCalledTimes(1);
    expect(testReleasePlugin.museCore.pm.afterReleasePlugin).toBeCalledTimes(1);
  });
});
