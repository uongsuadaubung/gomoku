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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-solid') || id.includes('canvas-confetti')) {
              return 'vendor-ui';
            }
            return 'vendor';
          }
          if (id.includes('/data/taunts/') || id.includes('\\data\\taunts\\')) {
            return 'taunt-database';
          }
        },
      },
    },
  },
});
