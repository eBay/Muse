const os = require('os');
const path = require('path');
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
  });
});
