const { vol } = require('memfs');
const plugin = require('js-plugin');
const { jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    am: {
      createApp: jest.fn(),
      beforeCreateApp: jest.fn(),
      afterCreateApp: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);
describe('Create app basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('', async () => {});
});
