const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    pm: {
      buildPlugin: jest.fn(),
      beforeBuildPlugin: jest.fn(),
      afterBuildPlugin: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Create plugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Build plugin should call ext points', async () => {
    await muse.pm.buildPlugin();

    expect(testJsPlugin.museCore.pm.buildPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeBuildPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterBuildPlugin).toBeCalledTimes(1);
  });
});
