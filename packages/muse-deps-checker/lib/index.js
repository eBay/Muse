//const muse = require('muse-core');

module.exports = {
    name: 'muse-deps-checker',
    museCore: {
      pm: {
        beforeDeployPlugin: (ctx, params) => {
          console.log(ctx);
          console.log(params);
          console.log('checking required dependencies before deploying plugin...');

          //const result = await muse.storage.assets.get(decodeURIComponent(`${params.pluginName}/v${params.version}/dist/deps-manifest.json`));
          //console.log(result);
        },
      },
    },
  };