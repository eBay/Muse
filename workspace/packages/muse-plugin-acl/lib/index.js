const museCore = require('@ebay/muse-core');
const beforeExts = require('./beforeExts');

module.exports = () => {
  const obj = {
    name: '@ebay/muse-plugin-acl',
    museCore: {
      ...beforeExts,
      data: {
        getBuilders: () => {
          return {
            key: 'muse.admins',
            get: async () => {
              return (
                museCore.utils.jsonByYamlBuff(
                  await museCore.storage.registry.get('/admins.yaml'),
                ) || []
              );
            },
          };
        },
        getMuseDataKeysByRawKeys: (rawDataType, keys) => {
          if (rawDataType !== 'registry') return null;
          if (keys.includes('/admins.yaml')) {
            return 'muse.admins';
          }
        },
      },
    },
    exports: {
      utils: require('./utils'),
      defineAbilityFor: require('./defineAbilityFor'),
      ability: require('@casl/ability'),
    },
  };

  return obj;
};
