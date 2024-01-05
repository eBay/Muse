import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs-extra';
import museEsbuildPlugin from '@ebay/muse-vite-plugin/lib/museEsbuildPlugin';
import museVitePlugin from '@ebay/muse-vite-plugin/lib/museVitePlugin';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.REACT_APP_MUSE_API_ENDPOINT': JSON.stringify(env.REACT_APP_MUSE_API_ENDPOINT),
    },
    plugins: [react(), museVitePlugin()],
    server: {
      // if port is specified in env, use it strictly
      // otherwise vite uses 5173 as default port and will try to use other ports if 5173 is occupied
      port: process.env.PORT,
      strictPort: true,
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      needsInterop: [],
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
        plugins: [
          // This plugin can be deleted if you use `tsx/jsx` for all React files.
          {
            name: 'load-js-files-as-jsx',
            setup(build) {
              build.onLoad({ filter: /src\\.*\.js$/ }, async (args) => ({
                loader: 'jsx',
                contents: await fs.readFile(args.path, 'utf8'),
              }));
            },
          },
          museEsbuildPlugin(),
        ],
      },
    },
  };
});
