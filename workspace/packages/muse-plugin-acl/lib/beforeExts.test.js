const museCore = require('@ebay/muse-core');

jest.mock('js-plugin');
describe('Before Exts For tests', () => {
  class Plugin {
    constructor(options) {
      this.owners = options.owners;
    }
  }
  class App {
    constructor(options) {
      this.owners = options.owners;
    }
  }
  let beforeExts;
  beforeEach(() => {
    beforeExts = require('./')().museCore;
  });
  it('Before Update App Permission check success', async () => {
    jest.spyOn(museCore.data, 'get').mockImplementation(() => {
      return [];
    });
    jest.spyOn(museCore.am, 'getApp').mockImplementation(() => {
      return new App({ owners: 'mockUser' });
    });

    beforeExts.am.beforeUpdateApp(null, { appName: 'mockApp', author: 'mockUser' });
  });

  it('Before Update App Permission check failed', async () => {
    jest.spyOn(museCore.data, 'get').mockImplementation(() => {
      return [];
    });
    jest.spyOn(museCore.am, 'getApp').mockImplementation(() => {
      return new App({ owners: 'mockUnAuthUser' });
    });

    await expect(beforeExts.am.beforeUpdateApp(null, { appName: 'mockApp' })).rejects.toThrow(
      Error,
    );
  });

  it('Before Update Plugin Permission check success', async () => {
    jest.spyOn(museCore.data, 'get').mockImplementation(() => {
      return [];
    });
    jest.spyOn(museCore.pm, 'getPlugin').mockImplementation(() => {
      return new Plugin({ owners: 'mockUser' });
    });
    beforeExts.pm.beforeUpdatePlugin(null, { appName: 'mockApp', author: 'mockUser' });
  });

  it('Before Update Deployed Plugin Permission check success', async () => {
    jest.spyOn(museCore.data, 'get').mockImplementation(() => {
      return [];
    });
    jest.spyOn(museCore.pm, 'getPlugin').mockImplementation(() => {
      return new Plugin({ owners: 'mockUser' });
    });
    beforeExts.pm.beforeUpdateDeployedPlugin(null, { appName: 'mockApp', author: 'mockUser' });
  });
  it('Asset Permission without message', async () => {
    const { assetPermission } = require('./utils');
    await expect(assetPermission(true)).toEqual(true);
  });
});
