// SESS Timetabling App - Production & Standalone Node.js Server Runner (Hono)

import('./packages/api/dist/node.js')
  .then((module) => {
    module.startServer();
  })
  .catch((err) => {
    console.error('Failed to start Hono server from packages/api:', err);
    console.error('Ensure you have built the API package first using "pnpm build" or "pnpm --filter @sess/api build"');
    process.exit(1);
  });