const _ = require('lodash');
const { getApps } = require('../../am');
const logger = require('../../logger').createLogger('muse.data.builder.app-by-url');

module.exports = {
  key: 'muse.app-by-url',
  get: async () => {
    logger.verbose(`Getting muse.app-by-url...`);
    const apps = await getApps();
    return apps.reduce((p, app) => {
      Object.entries(app.envs || {}).forEach(([envName, env]) => {
        if (env.url) {
          _.castArray(env.url)
            .filter(Boolean)
            .forEach(u => {
              p[u] = {
                appName: app.name,
                envName,
              };
            });
        }
      });
      return p;
    }, {});
  },
  getMuseDataKeysByRawKeys: (rawDataType, keys) => {
    if (rawDataType !== 'registry') return null;
    logger.verbose(`Getting Muse data keys...`);
    if (
      keys.some(k => {
        const arr = k.split('/').filter(Boolean);
        return arr.length === 3 && arr[0] === 'apps' && arr[2]?.endsWith('.yaml');
      })
    ) {
      return 'muse.app-by-url';
    }
  },
};
