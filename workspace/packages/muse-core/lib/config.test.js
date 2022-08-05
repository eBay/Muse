const os = require('os');
const path = require('path');
const yaml = require('js-yaml');

const testRegistryDir = path.join(__dirname, '/_muse_test_dir/muse-storage/registry');
describe('Config basic tests.', () => {
  beforeAll(() => {});
  beforeEach(() => {
    jest.resetModules();
  });

  it('Test read config from cwd', async () => {
    // const { vol } = require('memfs');
    const fs = require('fs-extra');

    fs.ensureDirSync(process.cwd());

    fs.writeFileSync(
      path.join(process.cwd(), 'muse.config.yaml'),
      yaml.dump({
        registry: { storage: { type: 'some-type', location: testRegistryDir } },
      }),
    );
    const muse = require('./');
    expect(muse.config?.registry?.storage?.type).toBe('some-type');
  });

  it('Test read config from home dir', async () => {
    const fs = require('fs-extra');
    fs.ensureDirSync(os.homedir());
    fs.writeFileSync(
      path.join(os.homedir(), '.muserc'),
      yaml.dump({
        registry: { storage: { type: 'some-type2', location: testRegistryDir } },
      }),
    );
    const muse = require('./');
    expect(muse.config?.registry?.storage?.type).toBe('some-type2');
  });

  it('It should load config from base config defined by extend.', async () => {
    jest.mock(
      'test-config-provider',
      () => {
        return {
          foo: 'bar',
        };
      },
      { virtual: true },
    );
    const fs = require('fs-extra');
    fs.ensureDirSync(os.homedir());
    fs.writeFileSync(
      path.join(os.homedir(), '.muserc.json'),
      JSON.stringify({
        extends: 'test-config-provider',
      }),
    );
    const muse = require('./');
    expect(muse.config.foo).toBe('bar');
  });

  it('Should evaluate env variables for config object', async () => {
    const fs = require('fs-extra');
    fs.ensureDirSync(os.homedir());
    fs.writeFileSync(
      path.join(os.homedir(), '.muserc'),
      yaml.dump({
        foo: {
          bar: '$env.TEST_ENV_1',
        },
        foo2: '$env.TEST_ENV_2',
      }),
    );
    process.env.TEST_ENV_1 = 'env1';
    process.env.TEST_ENV_2 = 'env2';
    const muse = require('./');
    expect(muse.config.get('foo.bar')).toBe('env1');
    expect(muse.config.get('foo2')).toBe('env2');
  });
});
