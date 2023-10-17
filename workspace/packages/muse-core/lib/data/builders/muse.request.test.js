const { vol } = require('memfs');
const muse = require('../../');

describe('Muse request builder tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('returns correct request with muse data api', async () => {
    await muse.req.createRequest({ id: 'r1', type: 'test-req', author: 'nate' });

    const request = await muse.data.get('muse.request.r1');
    expect(request).toMatchObject({
      id: 'r1',
      type: 'test-req',
      createdBy: 'nate',
    });
  });
});
