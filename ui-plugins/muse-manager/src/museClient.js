import mClient from '@ebay/muse-client';

const museClient = mClient.create({
  // endpoint: 'https://musenextsvc.vip.qa.ebay.com/api/v2',
  endpoint: 'http://localhost:6070/api/v2',
  // endpoint: 'http://localhost:8080/api/v2',
  token: window.MUSE_GLOBAL.getUser().museSession,
});
export default museClient;
