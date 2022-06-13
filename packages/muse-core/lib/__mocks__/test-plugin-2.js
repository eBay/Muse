module.exports = {
  name: 'test-plugin-2',
  museCore: {
    assets: {
      storage: {
        get: () => Buffer.from('dummy get assets'),
      },
    },
  },
};
