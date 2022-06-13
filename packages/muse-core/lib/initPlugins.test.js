const yaml = require('js-yaml');

describe('initializer basic tests.', () => {
  beforeAll(() => {});
  beforeEach(() => {
    jest.resetModules();
  });
  it('Test read config from cwd', async () => {
    const fs = require('fs-extra');
    const path = require('path');

    // Define two plugins for the plugin
    fs.ensureDirSync(process.cwd());
    fs.writeFileSync(
      path.join(process.cwd(), 'muse.config.yaml'),
      yaml.dump({
        plugins: ['test-plugin-1', ['test-plugin-2', { foo: 'bar' }]],
      }),
    );
    const muse = require('./');
    const registryGet = await muse.storage.registry.getString('foo');
    const assetsGet = await muse.storage.assets.getString('foo');
    expect(registryGet).toEqual('dummy get registry');
    expect(assetsGet).toEqual('dummy get assets');
  });

  it('It throws error if plugin  not found', async () => {
    const fs = require('fs-extra');
    const path = require('path');

    // Define two plugins for the plugin
    fs.ensureDirSync(process.cwd());
    fs.writeFileSync(
      path.join(process.cwd(), 'muse.config.yaml'),
      yaml.dump({
        plugins: ['test-plugin-3'],
      }),
    );

    expect(() => require('./')).toThrowError();
  });

  it('It handles presets as a single string', async () => {
    const fs = require('fs-extra');
    const path = require('path');
    jest.mock(
      'test-muse-preset',
      () => {
        return ['test-plugin-1', ['test-plugin-2', { foo: 'bar' }]];
      },
      { virtual: true },
    );
    // Define two plugins for the plugin
    fs.ensureDirSync(process.cwd());
    fs.writeFileSync(
      path.join(process.cwd(), 'muse.config.yaml'),
      yaml.dump({
        presets: 'test-muse-preset',
      }),
    );
    const muse = require('./');
    const registryGet = await muse.storage.registry.getString('foo');
    const assetsGet = await muse.storage.assets.getString('foo');
    expect(registryGet).toEqual('dummy get registry');
    expect(assetsGet).toEqual('dummy get assets');
  });

  it('It handles presets as an array', async () => {
    const fs = require('fs-extra');
    const path = require('path');
    jest.mock(
      'test-muse-preset',
      () => {
        return ['test-plugin-1', ['test-plugin-2', { foo: 'bar' }]];
      },
      { virtual: true },
    );
    // Define two plugins for the plugin
    fs.ensureDirSync(process.cwd());
    fs.writeFileSync(
      path.join(process.cwd(), 'muse.config.yaml'),
      yaml.dump({
        presets: ['test-muse-preset'],
      }),
    );
    const muse = require('./');
    const registryGet = await muse.storage.registry.getString('foo');
    const assetsGet = await muse.storage.assets.getString('foo');
    expect(registryGet).toEqual('dummy get registry');
    expect(assetsGet).toEqual('dummy get assets');
  });
});
