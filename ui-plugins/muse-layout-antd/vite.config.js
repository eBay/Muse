import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react-swc';
import museVitePlugin from '@ebay/muse-vite-plugin';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), museVitePlugin(), cssInjectedByJsPlugin()],
    test: {
      include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      coverage: {
        include: ['src/**'],
        // cobertura and html reporters are used by Muse CI
        reporter: ['cobertura', 'html', 'text'],
      },
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.js',
      testTimeout: 30000,
    },
  };
});
