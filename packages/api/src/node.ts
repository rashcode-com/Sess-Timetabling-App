import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import app from './app.js';
import path from 'node:path';
import fs from 'node:fs';

const rootApp = new Hono();

// Mount API routes under /api
rootApp.route('/', app);

// Static file serving for apps/web/dist in Node environment
const distPath = path.resolve(process.cwd(), 'apps/web/dist');
const altDistPath = path.resolve(process.cwd(), 'dist');
const activeDist = fs.existsSync(distPath) ? distPath : (fs.existsSync(altDistPath) ? altDistPath : null);

if (activeDist) {
  const relativeDist = path.relative(process.cwd(), activeDist);
  rootApp.use('/*', serveStatic({ root: relativeDist }));
  
  // SPA fallback to index.html
  rootApp.get('*', serveStatic({ root: relativeDist, path: 'index.html' }));
} else {
  rootApp.get('/', (c) => {
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head><title>SESS Timetabling API</title></head>
        <body style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto;">
          <h1>🚀 SESS Timetabling API Gateway</h1>
          <p>Running in Node.js standalone mode via <code>@hono/node-server</code>.</p>
          <ul>
            <li><a href="/api/health">GET /api/health</a></li>
            <li><a href="/api/departments">GET /api/departments</a></li>
            <li><a href="/api/courses">GET /api/courses</a></li>
          </ul>
          <p><em>Note: Web frontend build (<code>apps/web/dist</code>) not found. Run <code>pnpm web:build</code> to enable frontend static serving.</em></p>
        </body>
      </html>
    `);
  });
}

const port = Number(process.env.PORT) || 3000;

export function startServer() {
  console.log(`🌐 SESS Hono Node Server starting on http://localhost:${port}`);
  return serve({
    fetch: rootApp.fetch,
    port
  });
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('node.ts') || process.argv[1]?.endsWith('node.js')) {
  startServer();
}

export default rootApp;
