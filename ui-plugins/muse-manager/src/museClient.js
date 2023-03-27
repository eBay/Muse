import mClient from '@ebay/muse-client';

const g = window.MUSE_GLOBAL;

const museClient = mClient.create({
  endpoint:
    'http://localhost:8080/api/v2' ||
    g.getPluginVariables('@ebay/muse-manager')?.museApiEndpoint ||
    g.getAppVariables()?.museApiEndpoint ||
    'https://musenextsvc.vip.qa.ebay.com/api/v2',
  token: g.getUser()?.museSession,
  axiosConfig: {
    timeout: 120000,
  },
});
export default museClient;
