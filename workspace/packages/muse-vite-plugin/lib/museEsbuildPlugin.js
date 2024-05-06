const { getMuseModuleCode, getMuseModule } = require('./utils');

module.exports = () => {
  return {
    name: 'muse-esbuild',
    setup(build) {
      build.onLoad({ filter: /\.m?[jt]sx?$/ }, async (args) => {
        const museModule = getMuseModule(args.path);
        if (!museModule) return;
        const museCode = getMuseModuleCode(museModule);
        if (museCode) {
          return {
            contents: museCode,
          };
        }
      });
    },
  };
};
