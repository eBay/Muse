const path = require('path');
const { vol } = require('memfs');
const muse = require('../');

describe('Check Release version tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Returns version passed as argument directly', async () => {
    const pluginName = 'test-plugin';
    const version = '1.0.0';

    await muse.pm.createPlugin({ pluginName });
    await muse.pm.releasePlugin({
      pluginName,
      version: '1.0.0',
      author: 'mcubellsbaeza',
    });

    await muse.pm.releasePlugin({
      pluginName,
      version: '2.0.0',
      author: 'mcubellsbaeza',
    });

    const r = await muse.pm.checkReleaseVersion({ pluginName, version });
    expect(r.version).toBe('1.0.0');
  });

  it('Returns version of latest release', async () => {
    const pluginName = 'test-plugin';

    await muse.pm.createPlugin({ pluginName });
    await muse.pm.releasePlugin({
      pluginName,
      version: '1.0.0',
      author: 'mcubellsbaeza',
    });
    await muse.pm.releasePlugin({
      pluginName,
      version: '2.0.0',
      author: 'mcubellsbaeza',
    });

    // no explicit version passed, we should get latest one available
    const r = await muse.pm.checkReleaseVersion({ pluginName });
    expect(r.version).toBe('2.0.0');
  });

  it('Throws error if no releases available to deploy yet', async () => {
    const pluginName = 'test-plugin';
    await muse.pm.createPlugin({ pluginName });
    await expect(muse.pm.checkReleaseVersion({ pluginName })).rejects.toThrowError(
      'test-plugin does not have any released versions yet.',
    );
  });

  it('Throws error if no release available for a specific version', async () => {
    const pluginName = 'test-plugin';
    const version = '2.0.0';
    await muse.pm.createPlugin({ pluginName });
    await muse.pm.releasePlugin({
      pluginName,
      version: '1.0.0',
      author: 'mcubellsbaeza',
    });
    await expect(muse.pm.checkReleaseVersion({ pluginName, version })).rejects.toThrowError(
      `Version 2.0.0 doesn't exist (or has been previously unregistered)`,
    );
  });
});
