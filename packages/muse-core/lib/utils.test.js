const { utils } = require('./');
var Ajv = require('ajv');
var ajv = new Ajv();

describe('utils basic tests.', () => {
  it('Update json with delta change', async () => {
    const obj = {
      name: 'testobj',
      items: [
        {
          name: 'item1',
          value: 1,
        },
        { name: 'item2', value: 2 },
        'abcd',
      ],
    };

    utils.updateJson(obj, {
      set: [
        {
          path: 'prop.a',
          value: 'a',
        },
        { path: 'prop.b', value: { c: 'c' } },
      ],
      unset: ['name'],
      remove: [
        { path: 'items', value: 'abcd' },
        { path: 'items', value: 1234 },
        { path: 'items', predicate: { name: 'item2' } },
      ],
      push: [
        {
          path: 'prop3.arr',
          value: 1,
        },
      ],
    });

    expect(obj.prop.a).toBe('a');
    expect(obj.prop.b.c).toBe('c');
    expect(obj.name).toBeUndefined();
    expect(obj.items.length).toBe(1);
    expect(obj.items[0].name).toBe('item1');
    expect(obj.prop3.arr[0]).toBe(1);
  });

  it('Generate new version should work', () => {
    const { genNewVersion } = utils;
    expect(genNewVersion()).toBe('1.0.0');
    expect(genNewVersion('1.0.0')).toBe('1.0.1');
    expect(genNewVersion('1.0.0', 'patch')).toBe('1.0.1');
    expect(genNewVersion('1.0.0', 'minor')).toBe('1.1.0');
    expect(genNewVersion('1.0.0', 'major')).toBe('2.0.0');
    expect(genNewVersion('1.0.0', 'prerelease-custom')).toBe('1.0.1-custom.0');
    expect(genNewVersion('1.0.0', 'prerelease-alpha')).toBe('1.0.1-alpha.0');
    expect(genNewVersion('1.0.0', 'prerelease-beta')).toBe('1.0.1-beta.0');
    expect(genNewVersion('1.0.1-beta.0', 'prerelease-beta')).toBe('1.0.1-beta.1');
    expect(genNewVersion('1.0.0', 'prepatch-alpha')).toBe('1.0.1-alpha.0');
    expect(genNewVersion('1.0.0', 'preminor-alpha')).toBe('1.1.0-alpha.0');
    expect(genNewVersion('1.0.0', 'premajor-alpha')).toBe('2.0.0-alpha.0');

    // Errors
    expect(() => genNewVersion('1.0.0', 'abc-beta')).toThrowError();
    expect(() => genNewVersion('1.0.0', 'aaa')).toThrowError();
    expect(() => genNewVersion('abc')).toThrowError();
  });

  it('Parse registry key should work', () => {
    const { parseRegistryKey } = utils;
    expect(parseRegistryKey('/apps/myapp/myapp.yaml')).toEqual({
      type: 'app',
      appName: 'myapp',
    });

    expect(parseRegistryKey('/apps/myapp/staging/myplugin.yaml')).toEqual({
      type: 'deployed-plugin',
      appName: 'myapp',
      pluginName: 'myplugin',
      envName: 'staging',
    });

    expect(parseRegistryKey('/plugins/myplugin.yaml')).toEqual({
      type: 'plugin',
      pluginName: 'myplugin',
    });

    expect(parseRegistryKey('/plugins/releases/myplugin.yaml')).toEqual({
      type: 'releases',
      pluginName: 'myplugin',
    });

    expect(parseRegistryKey('/unknown-pattern')).toBeNull();
  });

  it('Validate should throw the error', () => {
    const schema = {
      properties: {
        appName: {
          type: 'string',
        },
      },
    };
    const data = {
      appName: 123,
    };
    expect(() => utils.validate(schema, data)).toThrowError();
  });

  it('Validate should work', () => {
    const schema = {
      properties: {
        appName: {
          type: 'string',
        },
      },
    };
    const data = {
      appName: 'guo',
    };
    utils.validate(schema, data);
    const valid = ajv.compile(schema, data);
    expect(valid).toBeTruthy();
  });

  it('Validate should skip the ajv.compile in the second', () => {
    const schema = {
      properties: {
        appName: {
          type: 'string',
        },
      },
    };
    const data = {
      appName: 'test',
    };
    expect(utils.ajvCache).toBeUndefined();
    utils.validate(schema, data);
    expect(utils.ajvCache).not.toBeNull();
  });
});
