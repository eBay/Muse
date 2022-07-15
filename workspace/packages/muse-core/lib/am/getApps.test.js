const { vol } = require('memfs');
const muse = require('../');

jest.mock('fs');
jest.mock('fs/promises');

describe('Get apps basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Get apps', async () => {
    let apps = await muse.am.getApps();
    expect(apps.length).toBe(0);
    await muse.am.createApp({ appName: 'test', author: 'nate' });
    apps = await muse.am.getApps();
    expect(apps.length).toBe(1);
    expect(apps[0]).toMatchObject({ name: 'test', createdBy: 'nate' });
  });
});
