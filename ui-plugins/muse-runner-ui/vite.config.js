import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import museVitePlugin from '@ebay/muse-vite-plugin';

export default defineConfig(() => {
  return {
    plugins: [react(), museVitePlugin()],
  };
});
