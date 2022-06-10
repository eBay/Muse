module.exports = {
    name: 'muse-deps-checker',
    museCore: {
      pm: {
        beforeDeployPlugin: () => console.log('checking required dependencies before deploying plugin...'),
      },
    },
  };