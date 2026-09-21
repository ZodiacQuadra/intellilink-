import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-framer-assets',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url.split('?')[0];
          const filename = path.basename(url);
          const assetPath = path.resolve(import.meta.dirname, 'assets', filename);
          if (filename && fs.existsSync(assetPath) && !fs.statSync(assetPath).isDirectory()) {
            const ext = path.extname(filename).toLowerCase();
            const mime = ext === '.svg' ? 'image/svg+xml' :
                         ext === '.png' ? 'image/png' :
                         ext === '.woff2' ? 'font/woff2' :
                         ext === '.mp4' ? 'video/mp4' : 'application/octet-stream';
            res.writeHead(200, {
              'Content-Type': mime,
              'Access-Control-Allow-Origin': '*'
            });
            return res.end(fs.readFileSync(assetPath));
          }
          next();
        });
      },
      closeBundle() {
        const srcDir = path.resolve(import.meta.dirname, 'assets');
        const distAssets = path.resolve(import.meta.dirname, 'dist', 'assets');
        if (fs.existsSync(srcDir)) {
          if (!fs.existsSync(distAssets)) {
            fs.mkdirSync(distAssets, { recursive: true });
          }
          fs.cpSync(srcDir, distAssets, { recursive: true });
        }
      }
    }
  ],
  resolve: {
    alias: {
      'framer': path.resolve(import.meta.dirname, 'src/framer-shim.js'),
    }
  },
  server: {
    port: 3000,
    host: true,
    watch: {
      ignored: ['**/_framer-xml/**', '**/Skills/**', '**/playwright-main/**', '**/reference/**', '**/*.mp4', '**/*.zip', '**/dist/**', '**/.git/**']
    }
  }
});
