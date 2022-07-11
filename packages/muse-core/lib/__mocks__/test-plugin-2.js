module.exports = ({ foo } = {}) => {
  return {
    name: 'test-plugin-2',
    museCore: {
      assets: {
        storage: {
          get: () => Buffer.from(foo || 'dummy get assets'),
        },
      },
    },
  };
};
