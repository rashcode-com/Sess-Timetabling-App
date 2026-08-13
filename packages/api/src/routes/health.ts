import { Hono } from 'hono';
import type { AppEnv } from '../types.js';

const healthRouter = new Hono<AppEnv>();

healthRouter.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: '@sess/api',
    timestamp: new Date().toISOString(),
    env: c.env?.ENVIRONMENT || 'development',
    hasKv: Boolean(c.env?.DATA_KV)
  });
});

export default healthRouter;
