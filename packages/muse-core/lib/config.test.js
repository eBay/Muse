const os = require('os');
const path = require('path');
const yaml = require('js-yaml');

const testRegistryDir = path.join(__dirname, '/_muse_test_dir/muse-storage/registry');
// jest.mock('/Users/pwang7/muse/muse-next/packages/muse-core/muse.config.js', () => () => {
//   return {
//     registry: { storage: { type: 'some-type', location: 'testRegistryDir' } },
//   };
// });
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
      // `module.exports = () => {
      //   return {
      //     registry: { storage: { type: 'some-type', location: testRegistryDir } },
      //   };
      // };`,
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
});
