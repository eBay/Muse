/*  global process  */

import fs from 'fs';
import { defineConfig } from 'vite';

const sslCrtFile = process.env.SSL_CRT_FILE;
const sslKeyFile = process.env.SSL_KEY_FILE;

export default defineConfig(() => {
  const isHTTPS = process.env.HTTPS === 'true';
  const port = process.env.PORT;
  const host = process.env.MUSE_LOCAL_HOST_NAME || 'localhost';

  return {
    server: {
      origin: port ? `${isHTTPS ? 'https' : 'http'}://${host}:${port}` : undefined,
      port,
      host,
      strictPort: !!port,
      https: process.env.HTTPS === 'true' && {
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
          entryFileNames: 'main.js',
          format: 'iife',
        },
      },
    },
  };
});