const { vol } = require('memfs');
const muse = require('../');

describe('Get request basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Get app should return correct json', async () => {
    const type = 'deploy-plugin';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'test-plugin',
      version: '1.0.0',
    };
    const req = await muse.req.createRequest({ type, author: 'nate', payload });
    const result = await muse.req.getRequest(req.id);
    expect(result).toMatchObject({ id: req.id, createdBy: 'nate', payload });
  });

  it('It returns null if request id not exists.', async () => {
    const result = await muse.req.getRequest('none-exist-id');
    expect(result).toBe(null);
  });
});
