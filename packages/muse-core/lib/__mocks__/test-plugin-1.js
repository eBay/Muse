module.exports = ({ foo } = {}) => {
  return {
    name: 'test-plugin-1',

    museCore: {
      registry: {
        storage: {
          get: () => Buffer.from(foo || 'dummy get registry'),
        },
      },
    },
  };
};
