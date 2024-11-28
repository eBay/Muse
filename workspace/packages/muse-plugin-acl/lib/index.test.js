const museCore = require('@ebay/muse-core');

describe('Index For tests', () => {
  let acl;
  beforeEach(() => {
    acl = require('./')();
  });
  it('Get Builders', async () => {
    jest.spyOn(museCore.storage.registry, 'get').mockImplementation(() => {
      return [];
    });
    await expect((await acl.museCore.data.getBuilders().get()).length).toEqual(0);
    await expect(acl.museCore.data.getBuilders().key).toEqual('muse.admins');
  });
  it('Get Muse Data Keys By Raw Keys', async () => {
    await expect(acl.museCore.data.getMuseDataKeysByRawKeys('registry', '/admins.yaml')).toEqual(
      'muse.admins',
    );
  });
  it('Get Muse Data Keys By Non Registry Raw Keys', async () => {
    await expect(acl.museCore.data.getMuseDataKeysByRawKeys('nonregistry', '/admins.yaml')).toEqual(
      null,
    );
  });
  it('Get Muse Data Keys By Non admin Keys', async () => {
    await expect(acl.museCore.data.getMuseDataKeysByRawKeys('registry', '/nonadmins.yaml')).toEqual(
      undefined,
    );
  });
});
