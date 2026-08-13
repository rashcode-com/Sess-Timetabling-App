import { Hono } from 'hono';
import type { AppEnv } from '../types.js';
import { getSemesterData } from '../storage.js';

const departmentsRouter = new Hono<AppEnv>();

departmentsRouter.get('/', async (c) => {
  const dataset = await getSemesterData(c);
  if (!dataset) {
    return c.json({ departments: [], error: 'Semester data not found' }, 404);
  }

  const departments = Object.keys(dataset);
  return c.json({
    count: departments.length,
    departments
  });
});

export default departmentsRouter;
