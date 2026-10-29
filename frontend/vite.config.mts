/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';

const proxyObject = {
  target: 'http://localhost:8080',
  ws: true,
  changeOrigin: true
};

// https://vitejs.dev/config/
export default defineConfig({
  // base: './',
  plugins: [tailwindcss(), vue(), vueDevTools(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': proxyObject,
      '/config': proxyObject
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    // Node 25+ native sessionStorage shadows happy-dom's and can't be spied on
    execArgv: ['--no-webstorage'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,vue}'],
    exclude: [...configDefaults.exclude, 'packages/template/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'clover', 'lcov']
    }
  }
});
