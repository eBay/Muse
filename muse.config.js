module.exports = {
  logLevel: 'silly',
  assetStorageCache: false,
  presets: [
    [
      '../muse-next-ebay/packages/muse-ebay-plugins',
      {
        'ebay-nukv-cache-plugin': {
          token: '$env.MUSE_NUKV_API_TOKEN',
        },
      },
    ],
  ],
  plugins: [
    [
      './packages/muse-plugin-git-storage',
      {
        pluginName: 'muse-plugin-git-storage',
        extPoint: 'museCore.registry.storage',
        endpoint: 'https://github.corp.ebay.com/api/v3',
        repo: 'muse/muse-registry',
        branch: 'dev',
        token: '$env.MUSE_REGISTRY_GIT_TOKEN',
      },
    ],
    [
      './packages/muse-plugin-s3-storage',
      {
        pluginName: 'nuobject-assets-ebay',
        extPoint: 'museCore.assets.storage',
        basePath: '',
        accessKey: '$env.NUOBJECT_ACCESS_KEY',
        secretKey: '$env.NUOBJECT_SECRET_KEY',
        endpoint: 'muse.nuobject.io',
        bucketName: 'testbucket',
      },
    ],
  ],
};
