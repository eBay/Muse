import mClient from '@ebay/muse-client';

const g = window.MUSE_GLOBAL;

const museClient = mClient.create({
  endpoint:
    process.env.REACT_APP_MUSE_API_ENDPOINT ||
    g.getPluginVariables('@ebay/muse-manager')?.museApiEndpoint ||
    g.getAppVariables()?.museApiEndpoint ||
    'https://musenextsvc.vip.qa.ebay.com/api/v2',
  token: g.getUser()?.museSession,
  axiosConfig: {
    timeout: 120000,
  },
  interceptors: {
    // Use prod api to get muse cache data
    'data.get': async () => {},
  },
});

export default museClient;
