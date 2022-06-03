module.exports = {
  name: 'test-plugin-2',
  museCore: {
    registry: {
      storage: {
        get: () => 'dummy get',
      },
    },
  },
};
