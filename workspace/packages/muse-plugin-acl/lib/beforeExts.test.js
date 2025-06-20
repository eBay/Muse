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
  class Release {
    constructor(options) {
      Object.assign(this, options);
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

  it('Before Update Release Permission check success', async () => {
    const pluginName = 'mockPlugin';
    const version = '1.0.0';
    const changes = {
      set: [{ path: 'description', value: 'Updated description' }],
    };

    jest.spyOn(museCore.pm, 'getPlugin').mockImplementation(() => {
      return new Plugin({ owners: ['mockUser'] });
    });
    jest.spyOn(museCore.pm, 'getReleases').mockImplementation(() => {
      return [
        new Release({ version: '1.0.0', description: 'Old description', owners: ['mockUser'] }),
      ];
    });

    await expect(
      beforeExts.pm.beforeUpdateRelease(null, { pluginName, version, author: 'mockUser', changes }),
    ).resolves.not.toThrow();

    expect(museCore.pm.getPlugin).toHaveBeenCalledWith(pluginName);
    expect(museCore.pm.getReleases).toHaveBeenCalledWith(pluginName);
  });

  it('Before Update Release Permission check failed - Plugin not exist', async () => {
    const pluginName = 'mockPlugin';
    const version = '1.0.0';
    const changes = {
      set: [{ path: 'description', value: 'Updated description' }],
    };

    jest.spyOn(museCore.pm, 'getPlugin').mockImplementation(() => null);

    await expect(
      beforeExts.pm.beforeUpdateRelease(null, { pluginName, version, author: 'mockUser', changes }),
    ).rejects.toThrow(`Plugin not exist: ${pluginName}`);
  });

  it('Before Update Release Permission check failed - Release not exist', async () => {
    const pluginName = 'mockPlugin';
    const version = '1.0.0';
    const changes = {
      set: [{ path: 'description', value: 'Updated description' }],
    };

    jest.spyOn(museCore.pm, 'getPlugin').mockImplementation(() => {
      return new Plugin({ owners: ['mockUser'] });
    });
    jest.spyOn(museCore.pm, 'getReleases').mockImplementation(() => []);

    await expect(
      beforeExts.pm.beforeUpdateRelease(null, { pluginName, version, author: 'mockUser', changes }),
    ).rejects.toThrow(`Release not exist: ${version}`);
  });

  it('Before Update Release Permission check failed - No changes provided', async () => {
    const pluginName = 'mockPlugin';
    const version = '1.0.0';

    jest.spyOn(museCore.pm, 'getPlugin').mockImplementation(() => {
      return new Plugin({ owners: ['mockUser'] });
    });
    jest.spyOn(museCore.pm, 'getReleases').mockImplementation(() => {
      return [
        new Release({ version: '1.0.0', description: 'Old description' }),
      ];
    });

    await expect(
      beforeExts.pm.beforeUpdateRelease(null, { pluginName, version, author: 'mockUser', changes: {} }),
    ).rejects.toThrow(`No changes provided for release ${version} of plugin ${pluginName}.`);
  });

  it('Before Update Release Permission check failed - Forbidden fields', async () => {
    const pluginName = 'mockPlugin';
    const version = '1.0.0';
    const changes = {
      set: [{ path: 'createdBy', value: ['newOwner'] }],
    };

    jest.spyOn(museCore.pm, 'getPlugin').mockImplementation(() => {
      return new Plugin({ owners: ['mockUser'] });
    });
    jest.spyOn(museCore.pm, 'getReleases').mockImplementation(() => {
      return [
        new Release({ version: '1.0.0', description: 'Old description', owners: ['mockUser'], createdBy: 'mockUser' }),
      ];
    });

    await expect(
      beforeExts.pm.beforeUpdateRelease(null, { pluginName, version, author: 'mockUser', changes }),
    ).rejects.toThrow(`No permission to update fields "createdBy" for release.`);
  });

  it('Asset Permission without message', async () => {
    const { assetPermission } = require('./utils');
    await expect(assetPermission(true)).toEqual(true);
  });
});
