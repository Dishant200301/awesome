import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/',
  esbuild: {
    target: "esnext",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  build: {
    target: "esnext",
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: "assets/index-[hash].js",
        chunkFileNames: "assets/index-[hash].js",
        assetFileNames: "assets/index-[hash][extname]",
      },
    },
  },
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api/ext': {
        target: 'http://localhost:5000',
        bypass: (_req, res) => {
          if (res) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Extension endpoint bypass' }));
          }
          return false;
        }
      }
    }
  }
});
