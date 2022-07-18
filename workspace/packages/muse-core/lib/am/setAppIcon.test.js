const { vol } = require('memfs');
const muse = require('../');

describe('Set app icon basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('Set app icon should work', async () => {
    const appName = 'testapp';
    await muse.am.createApp({ appName, author: 'nate' });

    await muse.am.setAppIcon({
      appName: 'testapp',
      icon: Buffer.from('someicon'),
    });
    const icon = await muse.storage.assets.getString(`/p/app-icon.${appName}/v0.0.1/dist/icon.png`);
    expect(icon).toEqual('someicon');
  });
});
