const path = require('path');
const { vol } = require('memfs');
const fs = require('fs-extra');
const plugin = require('js-plugin');

jest.mock('fs');
jest.mock('fs/promises');

const testReleasePlugin = {
  museCore: {
    pm: {
      beforeReleasePlugin: jest.fn(),
      releasePlugin: jest.fn(),
      afterReleasePlugin: jest.fn(),
    },
  },
};
describe('FileStorage basic tests.', () => {
  beforeAll(async () => {
    // create a mock muse config
    const testDir = path.join(__dirname, '/_muse_test_dir');

    fs.writeFileSync(
      path.join(process.cwd(), 'muse.config.yaml'),
      `
registry:
storage:
type: file
location: ${testDir}
`,
    );

    const muse = require('../../lib');
  });

  beforeEach(() => {
    vol.reset();
  });

  it('releasePlugin basic tests', async () => {});
});
