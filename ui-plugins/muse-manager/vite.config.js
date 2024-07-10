import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import museVitePlugin from '@ebay/muse-vite-plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.REACT_APP_MUSE_API_ENDPOINT': JSON.stringify(env.REACT_APP_MUSE_API_ENDPOINT),
    },
    server: {
      host: 'local.cloud.ebay.com',
    },
    plugins: [react(), museVitePlugin()],
  };
});
