import fs from 'node:fs';
import path from 'node:path';
import { SemesterData, SemesterDataSchema, UnifiedCatalog, UnifiedCatalogSchema } from '@sess/core';
import { logger } from './logger.js';

/**
 * Validates and exports dataset into formatted JSON with 4-space indentation,
 * wrapping the scraped department data under the specified semester in UnifiedCatalog.
 */
export async function saveDatasetAsJson(
  dataset: SemesterData,
  outputPath: string,
  semester: string
): Promise<UnifiedCatalog> {
  if (!semester) {
    throw new Error('[crawler] A valid semester identifier is required to save dataset.');
  }

  // Validate department courses structure
  SemesterDataSchema.parse(dataset);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let finalCatalog: UnifiedCatalog;

  if (fs.existsSync(outputPath)) {
    try {
      const existingRaw = fs.readFileSync(outputPath, 'utf-8');
      const existingJson = JSON.parse(existingRaw);

      if (existingJson && typeof existingJson === 'object' && 'semesters' in existingJson) {
        finalCatalog = {
          updated_at: new Date().toISOString(),
          active_semester: semester,
          semesters: {
            ...existingJson.semesters,
            [semester]: dataset,
          },
        };
      } else {
        // Migrating existing flat dataset
        finalCatalog = {
          updated_at: new Date().toISOString(),
          active_semester: semester,
          semesters: {
            [semester]: dataset,
          },
        };
      }
    } catch {

      finalCatalog = {
        updated_at: new Date().toISOString(),
        active_semester: semester,
        semesters: {
          [semester]: dataset,
        },
      };
    }
  } else {
    finalCatalog = {
      updated_at: new Date().toISOString(),
      active_semester: semester,
      semesters: {
        [semester]: dataset,
      },
    };
  }

  // Validate resulting catalog structure
  UnifiedCatalogSchema.parse(finalCatalog);

  const jsonString = JSON.stringify(finalCatalog, null, 4);
  fs.writeFileSync(outputPath, jsonString, 'utf-8');
  logger.success(`Dataset saved successfully to: ${outputPath} (Semester: ${semester}, Updated: ${finalCatalog.updated_at})`);

  // Auto-sync to apps/web/public/data/data.json if in monorepo environment
  try {
    const webPublicPath = path.resolve(dir, '../../../apps/web/public/data/data.json');
    if (fs.existsSync(path.resolve(dir, '../../../apps/web'))) {
      const webPublicDir = path.dirname(webPublicPath);
      if (!fs.existsSync(webPublicDir)) {
        fs.mkdirSync(webPublicDir, { recursive: true });
      }
      fs.writeFileSync(webPublicPath, jsonString, 'utf-8');
      logger.info(`Dataset automatically synced to web public asset: ${webPublicPath}`);
    }
  } catch {
    // Non-critical in isolated environments
  }

  return finalCatalog;
}

/**
 * Syncs the dataset to @sess/api POST /api/sync endpoint.
 */
export async function syncToApi(
  dataset: SemesterData | UnifiedCatalog,
  apiUrl: string,
  syncToken?: string,
  semester?: string
): Promise<boolean> {
  const endpoint = `${apiUrl.replace(/\/$/, '')}/api/sync`;
  logger.info(`Syncing dataset to API gateway at: ${endpoint}...`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (syncToken) {
    headers['X-Sync-Token'] = syncToken;
  }

  let payload: UnifiedCatalog;

  if ('semesters' in dataset && 'active_semester' in dataset) {
    payload = dataset as UnifiedCatalog;
  } else {
    if (!semester) {
      throw new Error('[crawler] A valid semester identifier is required to sync flat dataset to API.');
    }
    payload = {
      updated_at: new Date().toISOString(),
      active_semester: semester,
      semesters: {
        [semester]: dataset as SemesterData,
      },
    };
  }



  // Ensure X-Semester header is present for explicit API routing
  headers['X-Semester'] = payload.active_semester;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`API sync failed (${response.status}): ${errorText}`);
      return false;
    }

    const result = await response.json() as any;
    logger.success(`API sync completed! Stats: ${result.stats?.departments || 0} departments, ${result.stats?.courses || 0} courses`);
    return true;
  } catch (err: any) {
    logger.error(`Failed to connect to API at ${endpoint}: ${err.message}`);
    return false;
  }
}
