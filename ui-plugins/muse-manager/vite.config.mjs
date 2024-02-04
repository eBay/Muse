import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import museEsbuildPlugin from '@ebay/muse-vite-plugin/lib/museEsbuildPlugin';
import museVitePlugin from '@ebay/muse-vite-plugin/lib/museVitePlugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.REACT_APP_MUSE_API_ENDPOINT': JSON.stringify(env.REACT_APP_MUSE_API_ENDPOINT),
    },
    plugins: [react(), museVitePlugin()],
    server: {
      // If port is specified in env, use it strictly
      // otherwise vite uses 5173 as default port and will try to use other ports if 5173 is occupied
      port: process.env.PORT,
      strictPort: true,
    },
    optimizeDeps: {
      needsInterop: [],
      esbuildOptions: {
        plugins: [museEsbuildPlugin()],
      },
    },
  };
});
