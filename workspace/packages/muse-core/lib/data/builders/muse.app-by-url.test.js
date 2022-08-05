const { vol } = require('memfs');
const muse = require('../../');

describe('Muse app builder tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('muse.app-by-url should return correct info', async () => {
    await muse.am.createApp({ appName: 'app1' });
    await muse.am.createEnv({
      appName: 'app1',
      envName: 'feature',
      options: { url: 'some.host.com' },
    });
    const appByUrl = await muse.data.get('muse.app-by-url');
    expect(appByUrl).toEqual({
      'some.host.com': { appName: 'app1', envName: 'feature' },
    });
  });
});
