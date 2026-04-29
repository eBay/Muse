import fs from 'fs';
import path from 'path';

function getPkgJson() {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
  } catch {
    return {};
  }
}

function getEntryFileName(pkgJson) {
  return pkgJson?.muse?.type === 'boot' ? 'boot.js' : 'main.js';
}

function mergeObjects(obj1, obj2) {
  for (const key in obj2) {
    if (obj1[key] && Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
      obj1[key] = [...obj1[key], ...obj2[key]];
    } else if (
      obj1[key] &&
      typeof obj1[key] === 'object' &&
      obj2[key] &&
      typeof obj2[key] === 'object'
    ) {
      mergeObjects(obj1[key], obj2[key]);
    } else if (!Object.prototype.hasOwnProperty.call(obj1, key)) {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}

export default function museVanillaVitePlugin() {
  const pkgJson = getPkgJson();
  const entryFileName = getEntryFileName(pkgJson);

  const sslCrtFile =
    process.env.SSL_CRT_FILE ||
    path.join(process.cwd(), './node_modules/.muse/certs/muse-dev-cert.crt');
  const sslKeyFile =
    process.env.SSL_KEY_FILE ||
    path.join(process.cwd(), './node_modules/.muse/certs/muse-dev-cert.key');

  return {
    name: 'muse-vanilla-vite-plugin',

    config(config) {
      const isHTTPS = process.env.HTTPS === 'true';
      const port = process.env.PORT;
      const host = config.server?.host || process.env.MUSE_LOCAL_HOST_NAME || 'localhost';

      const configToBeMerged = {
        server: {
          origin: port ? `${isHTTPS ? 'https' : 'http'}://${host}:${port}` : undefined,
          port,
          host,
          strictPort: !!port,
          https:
            isHTTPS &&
            fs.existsSync(sslCrtFile) &&
            fs.existsSync(sslKeyFile) && {
              cert: fs.readFileSync(sslCrtFile),
              key: fs.readFileSync(sslKeyFile),
            },
        },
        build: {
          sourcemap: true,
          outDir: 'build/dist',
          rollupOptions: {
            input: 'src/main.js',
            output: {
              entryFileNames: entryFileName,
              format: 'iife',
            },
          },
        },
      };

      mergeObjects(config, configToBeMerged);
    },
  };
}
