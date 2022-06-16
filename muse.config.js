module.exports = {
  plugins: [
    [
      './packages/muse-plugin-git-storage',
      {
        pluginName: 'muse-plugin-git-storage',
        extPoint: 'museCore.registry.storage',
        url: 'https://github.corp.ebay.com',
        organizationName: 'gling',
        projectName: 'muse-registry-sample',
        token: '$env.MY_TOKEN',
      },
    ],
    [
      './packages/muse-plugin-s3-storage',
      {
        pluginName: 'nuobject-assets-ebay',
        extPoint: 'museCore.assets.storage',
        basePath: '',
        accessKey: 'muse-ffe8f21c-3718-4d62-8278-f4a4905826b1',
        secretKey: '9127d30c-8726-4901-84c5-816058533539',
        endPoint: 'muse.nuobject.io',
        bucketName: 'testbucket',
      },
    ],
  ],
};
