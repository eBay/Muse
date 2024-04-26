const { getMuseModuleCode } = require('./utils');

module.exports = () => {
  return {
    name: 'muse-esbuild',
    setup(build) {
      build.onLoad({ filter: /\.m?[jt]sx?$/ }, async (args) => {
        const museCode = getMuseModuleCode(args.path);
        if (museCode) {
          return {
            contents: museCode,
          };
        }
      });
    },
  };
};
