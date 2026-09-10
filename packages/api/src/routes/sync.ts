import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { CatalogDatasetSchema } from '@sess/core';
import type { AppEnv } from '../types.js';
import { saveSemesterData } from '../storage.js';
import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time string comparison using SHA-256 digests via Web Crypto + timingSafeEqual.
 * Protects against timing side-channel attacks and avoids leaking secret length across both Workers and Node.
 */
async function timingSafeEqualStrings(a: string, b: string): Promise<boolean> {
  if (!a || !b) return false;
  const enc = new TextEncoder();
  const [digestA, digestB] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b))
  ]);
  return timingSafeEqual(new Uint8Array(digestA), new Uint8Array(digestB));
}

const syncRouter = new Hono<AppEnv>();

syncRouter.post('/', zValidator('json', CatalogDatasetSchema), async (c) => {
  // Enforce authentication: fail-closed if SYNC_TOKEN is missing or unauthorized
  const expectedToken = c.env?.SYNC_TOKEN || (typeof process !== 'undefined' ? process.env?.SYNC_TOKEN : undefined);
  if (!expectedToken) {
    console.error(JSON.stringify({
      level: 'error',
      message: 'SYNC_TOKEN is not configured in server environment. Rejecting mutation request.',
      path: c.req.path
    }));
    return c.json({ error: 'Server misconfiguration: SYNC_TOKEN is required for data sync' }, 500);
  }

  const authHeader = c.req.header('Authorization');
  const syncTokenHeader = c.req.header('X-Sync-Token');
  const providedToken = syncTokenHeader || (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : '');

  const isValid = await timingSafeEqualStrings(providedToken, expectedToken);
  if (!isValid) {
    return c.json({ error: 'Unauthorized: Invalid sync token' }, 401);
  }

  const payload = c.req.valid('json');

  let semesterParam: string;
  if ('semesters' in payload && payload.active_semester) {
    semesterParam = payload.active_semester;
  } else {
    const fromQueryOrHeader = c.req.query('semester') || c.req.header('X-Semester');
    if (!fromQueryOrHeader) {
      return c.json({
        error: 'Bad Request: Missing semester identifier. Please provide ?semester=<id>, X-Semester header, or a UnifiedCatalog payload with active_semester.'
      }, 400);
    }
    semesterParam = fromQueryOrHeader;
  }

  const success = await saveSemesterData(c, payload, semesterParam);


  if (!success) {
    return c.json({ error: 'Failed to save dataset' }, 500);
  }

  let departmentCount = 0;
  let totalCourses = 0;

  if ('semesters' in payload) {
    const activeSemData = payload.semesters[payload.active_semester] || {};
    departmentCount = Object.keys(activeSemData).length;
    for (const deptKey of Object.keys(activeSemData)) {
      totalCourses += Object.keys(activeSemData[deptKey] || {}).length;
    }
  } else {
    departmentCount = Object.keys(payload).length;
    for (const deptKey of Object.keys(payload)) {
      const deptObj = payload[deptKey];
      if (deptObj) {
        totalCourses += Object.keys(deptObj).length;
      }
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

