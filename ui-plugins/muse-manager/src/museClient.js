import mClient from '@ebay/muse-client';

const g = window.MUSE_GLOBAL;

const museClient = mClient.create({
  endpoint:
    g.pluginVariables?.['@ebay/muse-manager']?.museApiEndpoint ||
    g.appVariables?.museApiEndpoint ||
    '/api/v2',
  token: g.getUser()?.museSession,
  axiosConfig: {
    timeout: 120000,
  },
});

export default museClient;
