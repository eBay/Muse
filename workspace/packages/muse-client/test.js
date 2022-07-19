const MuseClient = require('./lib/MuseClient');
const httpsAgent = new (require('https').Agent)({
  rejectUnauthorized: false,
});
const muse = new MuseClient({
  endpoint: 'http://localhost:6070/api/v2', // 'https://musenextsvc.vip.qa.ebay.com/api/v2',
  axiosConfig: {
    httpsAgent,
  },
});

(async () => {
  try {
    // const data = await muse.a.b.c.d.tes1t();
    // const data = await muse.data.get('muse.app.nateapp');
    // const data = await muse.am.getApps('muse.npm.versions');
    const data = await muse.am.createApp({ appName: 'app9' });
    console.log(data);
  } catch (err) {
    console.log(err);
    console.log(err?.response?.data?.error);
    console.log(err.message);
  }
})();
