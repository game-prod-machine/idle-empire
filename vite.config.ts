import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'esnext',
  },
  server: {
    port: 3000,
    open: true,
  },
});
