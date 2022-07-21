import museClient from '@ebay/muse-client';

const client = museClient.create({
  endpoint: 'https://musenextsvc.vip.qa.ebay.com/api/v2',
});
export default client;
