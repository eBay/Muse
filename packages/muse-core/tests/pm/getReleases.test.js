const path = require('path');
const { vol } = require('memfs');
const muse = require('../../lib');

jest.mock('fs');
jest.mock('fs/promises');

describe('FileStorage basic tests.', () => {
  const testDir = path.join(__dirname, '/_muse_test_dir');

  beforeEach(() => {
    vol.reset();
  });

  it('Test set and get', async () => {});
});
