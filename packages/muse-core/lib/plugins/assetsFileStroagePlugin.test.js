const { vol } = require('memfs');
const plugin = require('js-plugin');
const { asyncInvokeFirst } = require('../utils');
const assetsFileStoragePlugin = require('./assetsFileStoragePlugin');

describe('AssetsFileStoragePlugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Test set and get', async () => {
    plugin.register(assetsFileStoragePlugin());
    await asyncInvokeFirst('museCore.assets.storage.set', 'foo', 'bar');
    const value = await asyncInvokeFirst('museCore.assets.storage.get', 'foo');
    expect(value.toString()).toBe('bar');
  });
});
