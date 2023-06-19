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

      // If you want to exposes all env variables, which is not recommended
      // 'process.env': env
    },
    plugins: [react(), museVitePlugin()],
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
