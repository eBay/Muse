import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.js'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      exclude: ['src/**/*.test.js'],
    },
  },
});
