import fs from 'fs';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import infoJsonRolldownPlugin from './infoJsonRolldownPlugin.js';

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

const ENTRY_CANDIDATES = ['src/index.ts', 'src/main.ts', 'src/index.js', 'src/main.js'];

function getEntryFile() {
  for (const candidate of ENTRY_CANDIDATES) {
    if (fs.existsSync(path.join(process.cwd(), candidate))) return candidate;
  }
  return null;
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
  const entryFile = getEntryFile();
  const pluginType = pkgJson?.muse?.type;
  const infoJsonPlugin = infoJsonRolldownPlugin();

  const sslCrtFile =
    process.env.SSL_CRT_FILE ||
    path.join(process.cwd(), './node_modules/.muse/certs/muse-dev-cert.crt');
  const sslKeyFile =
    process.env.SSL_KEY_FILE ||
    path.join(process.cwd(), './node_modules/.muse/certs/muse-dev-cert.key');

  const vanillaPlugin = {
    name: 'muse-vanilla-vite-plugin',

    config(config) {
      if (!entryFile) {
        throw new Error('No entry file found. Add a src/[index|main].[js|ts|jsx|tsx] file.');
      }

      const isHTTPS = process.env.HTTPS === 'true';
      const port = process.env.PORT;
      const host = config.server?.host || process.env.MUSE_LOCAL_HOST_NAME || 'localhost';

      const defaults = {
        server: {
          origin: port ? `${isHTTPS ? 'https' : 'http'}://${host}:${port}` : undefined,
          port,
          host,
          strictPort: !!port,
          https: isHTTPS &&
            fs.existsSync(sslCrtFile) &&
            fs.existsSync(sslKeyFile) && {
              cert: fs.readFileSync(sslCrtFile),
              key: fs.readFileSync(sslKeyFile),
            },
        },
        build: {
          sourcemap: true,
          outDir: 'build/dist',
          rolldownOptions: {
            input: entryFile,
            output: {
              entryFileNames: entryFileName,
              format: 'es',
              codeSplitting: false,
            },
          },
        },
      };

      // Also mutate config for backwards-compat with tests that inspect the object directly
      mergeObjects(config, defaults);
      // Return defaults so Vite deep-merges them with user config (user config wins)
      return defaults;
    },

    handleHotUpdate({ server }) {
      // boot and init plugins don't support HMR — any change triggers a full page reload
      if (pluginType === 'boot' || pluginType === 'init') {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };

  return [vanillaPlugin, cssInjectedByJsPlugin(), infoJsonPlugin];
}
