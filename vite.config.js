import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'sim-watcher',
      configureServer(server) {
        const simsDir = path.resolve(__dirname, 'sims');
        if (!fs.existsSync(simsDir)) {
          fs.mkdirSync(simsDir, { recursive: true });
        }
        server.watcher.on('add', (file) => {
          if (file.endsWith('.jsx') && file.includes(path.sep + 'sims' + path.sep)) {
            server.restart();
          }
        });
        server.watcher.on('unlink', (file) => {
          if (file.endsWith('.jsx') && file.includes(path.sep + 'sims' + path.sep)) {
            server.restart();
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
