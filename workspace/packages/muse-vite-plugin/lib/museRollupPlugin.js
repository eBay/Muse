const { getMuseModuleCode } = require('./utils');

module.exports = () => {
  return {
    name: 'muse-rollup',
    load: (id) => {
      const museCode = getMuseModuleCode(id);
      return museCode || undefined;
    },
  };
};
