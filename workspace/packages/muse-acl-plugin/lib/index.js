const _ = require('lodash');
const museCore = require('@ebay/muse-core');
const beforeExts = require('./beforeExts');

module.exports = ({ pluginName, extPoint, options }) => {
  const obj = {
    name: pluginName || 'muse-acl-plugin',
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
      },
    },
  };

  return obj;
};
