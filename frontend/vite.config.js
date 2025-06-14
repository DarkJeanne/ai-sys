import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  build: {
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  }
}); 