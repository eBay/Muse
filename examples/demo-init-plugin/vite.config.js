import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  return {
    build: {
      outDir: path.resolve(__dirname, 'build/dist'),
      rollupOptions: {
        output: {
          entryFileNames: 'main.js',
        },
      },
    },
    server: {
      port: process.env.PORT,
    },
  };
});
