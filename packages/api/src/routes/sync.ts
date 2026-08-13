import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { SemesterDataSchema } from '@sess/core';
import type { AppEnv } from '../types.js';
import { saveSemesterData } from '../storage.js';

const syncRouter = new Hono<AppEnv>();

syncRouter.post('/', zValidator('json', SemesterDataSchema), async (c) => {
  // Check authorization token if SYNC_TOKEN is set
  const expectedToken = c.env?.SYNC_TOKEN;
  if (expectedToken) {
    const authHeader = c.req.header('Authorization');
    const syncTokenHeader = c.req.header('X-Sync-Token');
    const token = syncTokenHeader || (authHeader ? authHeader.replace('Bearer ', '') : '');

    if (token !== expectedToken) {
      return c.json({ error: 'Unauthorized: Invalid sync token' }, 401);
    }
  }

  const payload = c.req.valid('json');
  const success = await saveSemesterData(c, payload);

  if (!success) {
    return c.json({ error: 'Failed to save dataset' }, 500);
  }

  const departmentCount = Object.keys(payload).length;
  let totalCourses = 0;
  for (const deptKey of Object.keys(payload)) {
    const deptObj = payload[deptKey];
    if (deptObj) {
      totalCourses += Object.keys(deptObj).length;
    }
  }

  return c.json({
    success: true,
    message: 'Semester dataset synced successfully',
    stats: {
      departments: departmentCount,
      courses: totalCourses,
      timestamp: new Date().toISOString()
    }
  });
});

export default syncRouter;
