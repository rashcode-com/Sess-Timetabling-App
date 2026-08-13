import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '../types.js';
import { getSemesterData } from '../storage.js';
import { arabicToPersian, teacherSearch, placeSearchHelper } from '@sess/core';
import type { Course } from '@sess/core';

const coursesQuerySchema = z.object({
  department: z.string().optional(),
  query: z.string().optional(),
  teacher: z.string().optional(),
  day: z.string().optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).optional(),
});

const coursesRouter = new Hono<AppEnv>();

coursesRouter.get('/', zValidator('query', coursesQuerySchema), async (c) => {
  const { department, query, teacher, day, limit } = c.req.valid('query');
  const dataset = await getSemesterData(c);

  if (!dataset) {
    return c.json({ courses: [], error: 'Semester data not found' }, 404);
  }

  let results: Course[] = [];

  // Filter by department if specified, else search all departments
  const deptKeys = department
    ? Object.keys(dataset).filter((d) => arabicToPersian(d).includes(arabicToPersian(department)))
    : Object.keys(dataset);

  for (const deptKey of deptKeys) {
    const deptCoursesObj = dataset[deptKey];
    if (!deptCoursesObj) continue;

    for (const courseId of Object.keys(deptCoursesObj)) {
      const course = deptCoursesObj[courseId];
      if (!course) continue;

      // Filter by search query (title or id)
      if (query) {
        const normQuery = arabicToPersian(query).toLowerCase();
        const normTitle = arabicToPersian(course.title).toLowerCase();
        const normId = course.id.toLowerCase();

        if (!normTitle.includes(normQuery) && !normId.includes(normQuery)) {
          continue;
        }
      }

      // Filter by teacher
      if (teacher && !teacherSearch(course, teacher)) {
        continue;
      }

      // Filter by day of week or location
      if (day && !placeSearchHelper(course, day)) {
        continue;
      }

      results.push(course);
    }
  }

  if (limit && limit > 0) {
    results = results.slice(0, limit);
  }

  return c.json({
    count: results.length,
    courses: results
  });
});

coursesRouter.get('/:id', async (c) => {
  const targetId = c.req.param('id');
  const dataset = await getSemesterData(c);

  if (!dataset) {
    return c.json({ error: 'Semester data not found' }, 404);
  }

  for (const deptKey of Object.keys(dataset)) {
    const deptCoursesObj = dataset[deptKey];
    if (!deptCoursesObj) continue;

    if (deptCoursesObj[targetId]) {
      return c.json({ course: deptCoursesObj[targetId] });
    }
  }

  return c.json({ error: 'Course not found' }, 404);
});

export default coursesRouter;
