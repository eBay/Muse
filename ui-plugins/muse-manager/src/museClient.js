import mClient from '@ebay/muse-client';

const g = window.MUSE_GLOBAL;

const museClient = mClient.create({
  endpoint:
    g.getPluginVariables('@ebay/muse-manager')?.museApiEndpoint ||
    g.getAppVariables()?.museApiEndpoint ||
    '/api/v2',
  token: g.getUser()?.museSession,
  axiosConfig: {
    timeout: 120000,
  },
});

export default museClient;
