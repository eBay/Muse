module.exports = {
  roots: ['<rootDir>/lib'],
  collectCoverageFrom: ['<rootDir>/lib/*'],
  clearMocks: true, // Automatically clear mock calls, instances, contexts and results before every test.
  testTimeout: 30000,
};
