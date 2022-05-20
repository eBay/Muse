const os = require('os');
const path = require('path');
const yaml = require('js-yaml');

jest.mock('fs');
jest.mock('fs/promises');
const testRegistryDir = path.join(__dirname, '/_muse_test_dir/muse-storage/registry');

describe('FileStorage basic tests.', () => {
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
      path.join(os.homedir(), 'muse.config.yaml'),
      yaml.dump({
        registry: { storage: { type: 'some-type2', location: testRegistryDir } },
      }),
    );
    const muse = require('./');
    expect(muse.config?.registry?.storage?.type).toBe('some-type2');
  });
});
