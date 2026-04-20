// This is to serve lib plugins at dev time, it uses vite build result
// The entryFile (museDevUtils.getEntryFile) is served by the content of build/dev/main.js
// All other files under ./build/dev are served by express.static
// It should support cors

import https from 'https';
import fs from 'fs-extra';
import express from 'express';
import path from 'path';
import devUtils from '@ebay/muse-dev-utils/lib/utils.js';

const sslCrtFile =
  process.env.SSL_CRT_FILE ||
  path.join(process.cwd(), './node_modules/.muse/certs/muse-dev-cert.crt');
const sslKeyFile =
  process.env.SSL_KEY_FILE ||
  path.join(process.cwd(), './node_modules/.muse/certs/muse-dev-cert.key');

let serverStarted = false;

const host = process.env.MUSE_LOCAL_HOST_NAME || 'localhost';

export default function startLibServer() {
  if (serverStarted) return;
  serverStarted = true;

  const port = process.env.PORT || 3000;
  const isHTTPS =
    process.env.HTTPS === 'true' && fs.existsSync(sslCrtFile) && fs.existsSync(sslKeyFile);
  const buildDevDir = path.join(process.cwd(), 'build/dev');
  const entryFile = devUtils.getEntryFile();
  const mainJsPath = path.join(buildDevDir, 'main.js');

  const app = express();

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  const entryUrlPath = '/' + entryFile;
  app.get(entryUrlPath, (req, res) => {
    res.type('application/javascript');
    res.sendFile(mainJsPath);
  });

  app.use('/src', express.static(buildDevDir));

  if (isHTTPS) {
    const httpsOptions = {
      cert: fs.readFileSync(sslCrtFile),
      key: fs.readFileSync(sslKeyFile),
    };
    https.createServer(httpsOptions, app).listen(port, () => {
      console.log(`Muse lib server running at https://${host}:${port}`);
    });
  } else {
    app.listen(port, () => {
      console.log(`Muse lib server running at http://${host}:${port}`);
    });
  }
}
