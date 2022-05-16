const path = require('path');
const _ = require('lodash');
const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../../lib');

jest.mock('fs');
jest.mock('fs/promises');

const storageTestPlugin = {
  name: 'storageTest',
  test: {
    get: jest.fn(async (pathKey) => {
      if (pathKey === 'error') throw new Error('Failed to get.');
      return Buffer.from('foo');
    }),
    beforeGet: jest.fn(),
    afterGet: jest.fn(),
    failedGet: jest.fn(),

    set: jest.fn(async (pathKey) => {
      if (pathKey === 'error') throw new Error('Failed to set.');
      return Buffer.from('foo');
    }),
    beforeSet: jest.fn(),
    afterSet: jest.fn(),
    failedSet: jest.fn(),

    del: jest.fn(async (pathKey) => {
      if (pathKey === 'error') throw new Error('Failed to del.');
      return Buffer.from('foo');
    }),
    beforeDel: jest.fn(),
    afterDel: jest.fn(),
    failedDel: jest.fn(),

    count: jest.fn(async (pathKey) => {
      if (pathKey === 'error') throw new Error('Failed to count.');
      return Buffer.from('foo');
    }),
    beforeCount: jest.fn(),
    afterCount: jest.fn(),
    failedCount: jest.fn(),

    list: jest.fn(async (pathKey) => {
      if (pathKey === 'error') throw new Error('Failed to list.');
      return Buffer.from('foo');
    }),
    beforeList: jest.fn(),
    afterList: jest.fn(),
    failedList: jest.fn(),
  },
};

plugin.register(storageTestPlugin);

describe('Storage basic tests.', () => {
  beforeAll(() => {});
  beforeEach(() => {
    vol.reset();
  });

  it('Test set', async () => {
    const storage = new muse.storage.Storage({ extPath: 'test' });
    await storage.set('test', 'test');
    expect(storageTestPlugin.test.set).toBeCalledTimes(1);
    expect(storageTestPlugin.test.beforeSet).toBeCalledTimes(1);
    expect(storageTestPlugin.test.afterSet).toBeCalledTimes(1);

    try {
      await storage.set('error');
    } catch (err) {
      expect(err.message).toBe('Failed to set.');
    }
    expect(storageTestPlugin.test.failedSet).toBeCalledTimes(1);
    expect(storageTestPlugin.test.failedSet.mock.lastCall?.[0]?.error?.message).toBe('Failed to set.');
    expect(storageTestPlugin.test.failedSet.mock.lastCall?.[1]).toBe('error');
  });

  it('Test get', async () => {
    const storage = new muse.storage.Storage({ extPath: 'test' });
    const result = (await storage.get('any')).toString();
    expect(result).toBe('foo');
    expect(storageTestPlugin.test.get).toBeCalledTimes(1);
    expect(storageTestPlugin.test.beforeGet).toBeCalledTimes(1);
    expect(storageTestPlugin.test.afterGet).toBeCalledTimes(1);

    try {
      await storage.get('error');
    } catch (err) {
      expect(err.message).toBe('Failed to get.');
    }
    expect(storageTestPlugin.test.failedGet).toBeCalledTimes(1);
    expect(storageTestPlugin.test.failedGet.mock.lastCall?.[0]?.error?.message).toBe('Failed to get.');
    expect(storageTestPlugin.test.failedGet.mock.lastCall?.[1]).toBe('error');
  });

  it('Test del', async () => {
    const storage = new muse.storage.Storage({ extPath: 'test' });
    await storage.del('test');
    expect(storageTestPlugin.test.beforeDel).toBeCalledTimes(1);
    expect(storageTestPlugin.test.afterDel).toBeCalledTimes(1);

    try {
      await storage.del('error');
    } catch (err) {
      expect(err.message).toBe('Failed to del.');
    }
    expect(storageTestPlugin.test.failedDel).toBeCalledTimes(1);
    expect(storageTestPlugin.test.failedDel.mock.lastCall?.[0]?.error?.message).toBe('Failed to del.');
    expect(storageTestPlugin.test.failedDel.mock.lastCall?.[1]).toBe('error');
  });

  it('Test count', async () => {
    const storage = new muse.storage.Storage({ extPath: 'test' });
    await storage.count('test');
    expect(storageTestPlugin.test.beforeCount).toBeCalledTimes(1);
    expect(storageTestPlugin.test.afterCount).toBeCalledTimes(1);

    try {
      await storage.count('error');
    } catch (err) {
      expect(err.message).toBe('Failed to count.');
    }
    expect(storageTestPlugin.test.failedCount).toBeCalledTimes(1);
    expect(storageTestPlugin.test.failedCount.mock.lastCall?.[0]?.error?.message).toBe('Failed to count.');
    expect(storageTestPlugin.test.failedCount.mock.lastCall?.[1]).toBe('error');
  });

  it('Test list', async () => {
    const storage = new muse.storage.Storage({ extPath: 'test' });
    await storage.list('test');
    expect(storageTestPlugin.test.beforeList).toBeCalledTimes(1);
    expect(storageTestPlugin.test.afterList).toBeCalledTimes(1);

    try {
      await storage.list('error');
    } catch (err) {
      expect(err.message).toBe('Failed to list.');
    }
    expect(storageTestPlugin.test.failedList).toBeCalledTimes(1);
    expect(storageTestPlugin.test.failedList.mock.lastCall?.[0]?.error?.message).toBe('Failed to list.');
    expect(storageTestPlugin.test.failedList.mock.lastCall?.[1]).toBe('error');
  });
});
