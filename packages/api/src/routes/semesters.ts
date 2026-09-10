import { Hono } from 'hono';
import type { AppEnv } from '../types.js';
import { getCatalogData } from '../storage.js';

const semestersRouter = new Hono<AppEnv>();

semestersRouter.get('/', async (c) => {
  const catalog = await getCatalogData(c);
  if (!catalog) {
    return c.json({ semesters: [], active_semester: null, error: 'Catalog data not found' }, 404);
  }

  const semesters = Object.keys(catalog.semesters);
  return c.json({
    active_semester: catalog.active_semester,
    semesters,
    updated_at: catalog.updated_at,
  });
});

export default semestersRouter;
