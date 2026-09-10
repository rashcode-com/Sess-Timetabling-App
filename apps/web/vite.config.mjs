import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReadStream, existsSync, readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

/**
 * Native Vite plugin to serve and bundle the single canonical dataset (SSOT)
 * from `packages/data/datasets/data.json` without file duplication or manual sync scripts.
 */
function canonicalDataPlugin() {
  const canonicalDataPath = path.resolve(__dirname, '../../packages/data/datasets/data.json');

  return {
    name: 'canonical-data-plugin',
    configureServer(server) {
      // 1. Add canonical dataset to Vite's file watcher for instant live reload
      if (existsSync(canonicalDataPath)) {
        server.watcher.add(canonicalDataPath);
      }

      server.watcher.on('change', (file) => {
        if (path.resolve(file) === canonicalDataPath) {
          server.config.logger.info('[canonical-data] Canonical data.json updated. Triggering live reload...', { timestamp: true });
          server.ws.send({ type: 'full-reload' });
        }
      });

      // 2. Stream canonical dataset on /data/data.json requests during development
      server.middlewares.use((req, res, next) => {
        const cleanUrl = req.url ? req.url.split('?')[0] : '';
        if (cleanUrl.endsWith('/data/data.json')) {
          if (!existsSync(canonicalDataPath)) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Canonical dataset not found' }));
          }
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          return createReadStream(canonicalDataPath).pipe(res);
        }
        next();
      });
    },
    generateBundle() {
      // 3. Emit canonical dataset as an unbundled static asset in dist/data/data.json
      if (existsSync(canonicalDataPath)) {
        this.emitFile({
          type: 'asset',
          fileName: 'data/data.json',
          source: readFileSync(canonicalDataPath, 'utf-8'),
        });
      } else {
        this.warn(`Canonical dataset not found at ${canonicalDataPath}`);
      }
    },
  };
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    vuetify({
      autoImport: true,
    }),
    canonicalDataPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
    },
    dedupe: ['vue', 'vuetify'],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  server: {
    port: 8081,
    strictPort: false,
    host: true,
    fs: {
      allow: ['..'],
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia', 'pinia-plugin-persistedstate', 'vuetify'],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
});
