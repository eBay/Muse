const { vol } = require('memfs');
const muse = require('../');

jest.mock('fs');
jest.mock('fs/promises');

describe('Get app basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Get app should return correct json', async () => {
    const appName = 'testapp';
    await muse.am.createApp({ appName, author: 'nate' });
    const result = await muse.am.getApp(appName);
    expect(result).toMatchObject({ name: appName, createdBy: 'nate', owners: ['nate'] });
  });

  it('It returns null if plugin not exists.', async () => {
    const appName = 'test-app-not-exist';
    const app = await muse.am.getApp(appName);
    expect(app).toBe(null);
  });
});
