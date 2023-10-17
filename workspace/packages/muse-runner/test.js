// import Command from './lib/Command.js';
import MuseRunner from './lib/MuseRunner.js';

import axios from 'axios';
const museRunner = new MuseRunner();
import https, { Agent } from 'https';

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});
(async () => {
  // await museRunner.startApp({ app: 'musemanager' });
  // await museRunner.startPlugin({ dir: '/Users/pwang7/muse/muse-next/ui-plugins/muse-manager' });
  // museRunner.attachPluginsToApp(5000, '@ebay/muse-manager');

  const client = axios.create({
    baseURL: 'https://api.muse.vip.ebay.com/v2',
    timeout: 30000,
    httpsAgent,
  });
  for (let i = 0; i < 1; i++) {
    console.time('time');
    const res = await client.get(`https://api.muse.vip.ebay.com/v2/muse-data/muse.npm.versions`);
    // const res = await fetch(`https://api.muse.vip.ebay.com/v2/muse-data/muse.npm.versions`, {
    //   agent: httpsAgent,
    // });
    console.log(res.data);
    console.timeEnd('time');
  }

  // var options = {
  //   host: 'api.muse.vip.ebay.com',
  //   port: 443,
  //   path: '/v2/muse-data/muse.npm.versions',
  //   method: 'GET',
  // };
  // var req = https.request(options, function (res) {
  //   console.log('STATUS: ' + res.statusCode);
  //   console.log('HEADERS: ' + JSON.stringify(res.headers));
  //   res.setEncoding('utf8');
  //   res.on('data', function (chunk) {
  //     console.log('BODY: ' + chunk);
  //   });
  // });
})();
// const cmd = new Command({});
// cmd.start({
//   cmd: 'pnpm start',
//   cwd: '/Users/pwang7/muse/muse-next/ui-plugins/muse-manager',
// });
