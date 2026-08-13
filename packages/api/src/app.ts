import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { AppEnv } from './types.js';
import healthRouter from './routes/health.js';
import departmentsRouter from './routes/departments.js';
import coursesRouter from './routes/courses.js';
import syncRouter from './routes/sync.js';

const app = new Hono<AppEnv>().basePath('/api');

// Global middleware
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Sync-Token']
}));

// Route composition (Chained for Hono RPC type inference)
const routes = app
  .route('/health', healthRouter)
  .route('/departments', departmentsRouter)
  .route('/courses', coursesRouter)
  .route('/sync', syncRouter);

export default app;
export type AppType = typeof routes;
