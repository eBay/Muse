const { vol } = require('memfs');
const muse = require('../../');

describe('Muse requests builder tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('muse.requests should return correct requests', async () => {
    await muse.am.createApp({ appName: 'app1' });
    await muse.pm.createPlugin({ pluginName: 'p1', author: 'nate' });

    await muse.pm.releasePlugin({ pluginName: 'p1', version: '1.0.0' });

    await muse.pm.deployPlugin({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'p1',
      version: '1.0.0',
    });

    let requests = await muse.data.get('muse.requests');
    expect(requests.length).toBe(0);
    const type = 'deploy-plugin';
    const id = 'testid';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'p1',
      version: '1.0.0',
    };
    const req = await muse.req.createRequest({ id, type, author: 'nate', payload });
    requests = await muse.data.get('muse.requests');
    expect(requests.length).toBe(1);
    expect(requests[0]).toMatchObject(req);
  });
});
