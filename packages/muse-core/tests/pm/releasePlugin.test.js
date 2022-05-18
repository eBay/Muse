const path = require('path');
const { vol } = require('memfs');
const fs = require('fs-extra');
const plugin = require('js-plugin');
const yaml = require('js-yaml');

jest.mock('fs');
jest.mock('fs/promises');

const testRegistryDir = path.join(__dirname, '/_muse_test_dir/muse-storage/registry');

const testReleasePlugin = {
  museCore: {
    pm: {
      beforeReleasePlugin: jest.fn(),
      releasePlugin: jest.fn(),
      afterReleasePlugin: jest.fn(),
    },
  },
};
describe('release plugin basic tests.', () => {
  beforeAll(async () => {
    // create a mock muse config
  });

  beforeEach(() => {
    vol.reset();
    fs.ensureDirSync(process.cwd());
    fs.writeFileSync(
      path.join(process.cwd(), 'muse.config.yaml'),
      yaml.dump({
        registry: { storage: { type: 'file', options: { location: testRegistryDir } } },
      }),
    );
  });

  it('releasePlugin basic tests', async () => {
    const muse = require('../../lib');

    fs.ensureDirSync(path.join(process.cwd(), 'build'));
    fs.writeFileSync(path.join(process.cwd(), 'build/info.json'), JSON.stringify({ size: 100 }));
    const pluginName = 'test-plugin';
    await muse.pm.releasePlugin({
      pluginName,
      version: '1.0.1',
      buildDir: path.join(process.cwd(), 'build'),
      author: 'nate',
    });

    const releases = await muse.pm.getReleases(pluginName);
    expect(releases.releases[0]).toMatchObject({ version: '1.0.1', author: 'nate' });
  });
});
