module.exports = {
    name: 'muse-deps-checker',
    museCore: {
      pm: {
        beforeDeployPlugin: async (ctx, params) => {
          console.log(ctx);
          console.log(params);
          console.log('checking required dependencies before deploying plugin...');

          const muse = require('muse-core');
          const result = await muse.storage.assets.get(decodeURIComponent(`${params.pluginName}/v${params.version}/dist/deps-manifest.json`));
          console.log(result);
        },
      },
    },
  };