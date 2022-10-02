import mClient from '@ebay/muse-client';

const endpoint = window.MUSE_GLOBAL.isLocal
  ? 'http://localhost:6070/api/v2'
  : 'https://musenextsvc.vip.qa.ebay.com/api/v2';
const museClient = mClient.create({
  // endpoint: 'https://musenextsvc.vip.qa.ebay.com/api/v2',
  // endpoint: 'http://localhost:6070/api/v2',
  // endpoint: 'http://localhost:8080/api/v2',
  endpoint,
  token: window.MUSE_GLOBAL.getUser()?.museSession,
  axiosConfig: {
    timeout: 120000,
  },
});
export default museClient;
