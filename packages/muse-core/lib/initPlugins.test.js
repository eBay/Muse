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
        plugins: [
          'test-plugin-1',
          {
            module: 'test-plugin-2',
            options: { foo: 'bar' },
          },
        ],
      }),
    );
    const muse = require('./');
    const registryGet = await muse.storage.registry.get('foo');
    const assetsGet = await muse.storage.assets.get('foo');
    expect(registryGet).toEqual('dummy get registry');
    expect(assetsGet).toEqual('dummy get assets');
  });

  it('It throws error if plugin module not found', async () => {
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
});
