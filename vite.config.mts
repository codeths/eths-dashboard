import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './frontend',
  build: {
    outDir: '../frontend-dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api/': 'http://localhost:3000',
    },
  },
  resolve: {
    alias: [
      {
        find: 'common',
        replacement: resolve(__dirname, 'common'),
      },
    ],
  },
});
