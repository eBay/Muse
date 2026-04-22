// This is to serve lib plugins at dev time, it uses vite build result
// The entryFile (museDevUtils.getEntryFile) is served by the content of build/dev/main.js
// All other files under ./build/dev are served by express.static under path /src/
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

const BUILD_TIMEOUT_MS = 10000;

let isBuilding = false;
let buildResolvers = [];

export function setBuildStarted() {
  isBuilding = true;
}

export function setBuildFinished() {
  isBuilding = false;
  const resolvers = buildResolvers;
  buildResolvers = [];
  resolvers.forEach((resolve) => resolve());
}

function waitForBuild() {
  if (!isBuilding) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const idx = buildResolvers.indexOf(resolve);
      if (idx !== -1) buildResolvers.splice(idx, 1);
      reject(new Error('Timed out waiting for build to finish'));
    }, BUILD_TIMEOUT_MS);

    buildResolvers.push(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

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
    waitForBuild()
      .then(() => next())
      .catch((err) => {
        res.status(503).send(err.message);
      });
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
