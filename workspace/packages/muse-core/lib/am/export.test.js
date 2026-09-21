const { vol } = require('memfs');
const path = require('path');
const plugin = require('js-plugin');
const muse = require('../');
const unzipper = require('unzipper');

jest.mock('unzipper');

const testJsPlugin = {
  name: 'test',
  museCore: {
    am: {
      beforeExport: jest.fn(),
      afterExport: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Export basic tests.', () => {
  beforeEach(() => {
    vol.reset();
    vol.fromJSON({
      [path.join(__dirname, '../../muse.png')]: '',
      [path.join(__dirname, './sw.js')]: '',
    });
  });
  it('Export should work', async () => {
    const appName = 'testapp';
    const envName = 'feature';
    const pluginName = 'test-plugin';
    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });

    await muse.pm.createPlugin({ pluginName, type: 'boot' });
    await muse.pm.releasePlugin({
      pluginName,
      version: 'minor',
      author: 'nate',
    });
    await muse.pm.deployPlugin({
      appName,
      envName,
      pluginName,
      version: '1.0.0',
      options: { prop1: 'prop1' },
    });

    unzipper.Open.buffer.mockResolvedValue({
      extract: () => {},
      files: [],
    });
    muse.storage.assets.get = jest.fn(() => {
      return 'test';
    });
    await muse.am.export({ appName, museGlobalProps: {}, envName, output: 'exportutonly' });

    // const app = await muse.am.getApp(appName);
    // expect(app.envs.feature).toMatchObject({ name: envName, createdBy: 'nate' });
    expect(unzipper.Open.buffer).toBeCalledTimes(1);
    expect(muse.storage.assets.get).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.beforeExport).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.afterExport).toBeCalledTimes(1);
  });

  it('encodes plugin metadata when embedding MUSE_GLOBAL in index.html', async () => {
    const fse = require('fs-extra');
    const xss = "</script><script>document.title='XSS_SCRIPT_BREAKOUT'</script>";
    const appName = 'xssapp';
    const envName = 'staging';
    const pluginName = 'xss-plugin';

    await muse.am.createApp({
      appName,
      author: 'nate',
      options: {
        title: xss,
        description: xss,
        pluginVariables: {
          [pluginName]: { xss_marker: xss },
        },
      },
    });
    await muse.pm.createPlugin({
      pluginName,
      type: 'boot',
      options: { variables: { common_marker: xss } },
    });
    await muse.pm.releasePlugin({
      pluginName,
      version: 'minor',
      author: 'nate',
    });
    await muse.pm.deployPlugin({
      appName,
      envName,
      pluginName,
      version: '1.0.0',
    });

    unzipper.Open.buffer.mockResolvedValue({
      extract: () => {},
      files: [],
    });
    muse.storage.assets.get = jest.fn(() => 'test');

    await muse.am.export({ appName, museGlobalProps: {}, envName, output: 'export-xss' });

    const indexHtml = fse.readFileSync(path.join(process.cwd(), 'export-xss/index.html'), 'utf8');
    expect(indexHtml).not.toMatch(/<\/script>\s*<script>/i);
    expect(indexHtml).toContain('\\u003c/script>');
    expect(indexHtml).toContain(`<title>${require('lodash').escape(xss)}</title>`);
  });

  it('It throws exception if app not exists.', async () => {
    const appName = 'testapp';
    const envName = 'feature';

    try {
      await muse.am.export({ appName, envName, output: 'exportutonly' });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`App ${appName} not exists.`);
    }
  });

  it('It throws exception if env not exists.', async () => {
    const appName = 'testapp';
    const envName = 'feature';
    await muse.am.createApp({ appName, author: 'nate' });

    try {
      await muse.am.export({ appName, envName, output: 'exportutonly' });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`Env ${envName} not exists.`);
    }
  });
});
