module.exports = async () => {
  return {
    name: 'testapp',
    envs: {
      staging: {
        url: '',
        pluginList: [
          { name: '@ebay/muse-boot', type: 'boot', version: '1.0.0' },
          { name: '@ebay/muse-react', version: '1.0.0' },
          { name: '@ebay/muse-antd', version: '1.0.0' },
          { name: 'muse-layout', version: '1.0.0' },
        ],
      },
    },
  };
};
