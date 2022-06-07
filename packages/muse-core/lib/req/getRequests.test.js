const { vol } = require('memfs');
const muse = require('../');

describe('Get requests basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Get requests', async () => {
    let requests = await muse.req.getRequests();
    expect(requests.length).toBe(0);
    const type = 'deploy-plugin';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'test-plugin',
      version: '1.0.0',
    };
    const req = await muse.req.createRequest({ type, author: 'nate', payload });
    requests = await muse.req.getRequests();
    expect(requests.length).toBe(1);
    expect(requests[0]).toMatchObject(req);
  });
});
