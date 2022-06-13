module.exports = {
  name: 'test-plugin-1',

  museCore: {
    registry: {
      storage: {
        get: () => Buffer.from('dummy get registry'),
      },
    },
  },
};
