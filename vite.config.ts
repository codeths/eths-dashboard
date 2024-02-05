/** @type {import('vite').UserConfig} */
export default {
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
};
