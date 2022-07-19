const MuseClient = require('./lib/MuseClient');
const httpsAgent = new (require('https').Agent)({
  rejectUnauthorized: false,
});
const client = new MuseClient({
  endpoint: 'http://localhost:6070/api/v2', // 'https://musenextsvc.vip.qa.ebay.com/api/v2',
  axiosConfig: {
    httpsAgent,
  },
});

(async () => {
  // const data = await client.get('am.getApp', 'nateapp');
  const data = await client.post('am.createApp', { appName: 'nateapp5' });
  console.log(data);
})();
