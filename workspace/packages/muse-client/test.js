const MuseClient = require('./lib/MuseClient');
const httpsAgent = new (require('https').Agent)({
  rejectUnauthorized: false,
});
//'http://localhost:8080/api/v2', //
const muse = new MuseClient({
  endpoint: 'https://musenextsvc.vip.qa.ebay.com/api/v2',
  axiosConfig: {
    httpsAgent,
  },
});

(async () => {
  try {
    // const data = await muse.a.b.c.d.tes1t();
    const data = await muse.data.get('muse.npm.versions');
    // const data = await muse.data.refreshCache('muse.npm.versions');
    // const data = await muse.am.getApps();
    // const data = await muse.am.createApp({ appName: 'app10' });
    console.log(data);
  } catch (err) {
    console.log(err);
    console.log(err?.response?.data?.error);
    console.log(err.message);
  }
})();
