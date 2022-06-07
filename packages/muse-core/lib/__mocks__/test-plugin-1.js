module.exports = {
  name: 'test-plugin-1',

  museCore: {
    registry: {
      storage: {
        get: () => 'dummy get registry',
      },
    },
  },
};
