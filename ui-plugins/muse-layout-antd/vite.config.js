import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import museVitePlugin from '@ebay/muse-vite-plugin';

export default defineConfig(() => {
  return {
    plugins: [react(), museVitePlugin()],
    test: {
      include: ['(tests|src)/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
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
