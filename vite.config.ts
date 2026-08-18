import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/gomoku/',
  plugins: [solid(), tailwindcss()],
  server: {
    port: 3000,
  },
  worker: {
    format: 'es',
  },
});
