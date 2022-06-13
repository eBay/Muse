const { vol } = require('memfs');
const plugin = require('js-plugin');
const { asyncInvokeFirst } = require('../utils');
const registryFileStoragePlugin = require('./registryFileStoragePlugin');

describe('registryFileStoragePlugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Test set and get', async () => {
    plugin.register(registryFileStoragePlugin());
    await asyncInvokeFirst('museCore.registry.storage.set', 'foo', 'bar');
    const value = await asyncInvokeFirst('museCore.registry.storage.get', 'foo');
    expect(value.toString()).toBe('bar');
  });
});
