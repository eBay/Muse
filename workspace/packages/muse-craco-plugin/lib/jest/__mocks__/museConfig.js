Object.defineProperty(window, 'MUSE_GLOBAL', {
  value: {
    isLocal: true,
    envName: 'dev',
    getUser: () => {
      return {
        museSession: 'fake',
        username: 'test',
      };
    },
    logout: jest.fn(),
    getAppVariables: () => {
      return {};
    },
    getPluginVariables: () => {
      return {};
    },
    getPublicPath: () => {
      return './';
    },
  },
});

