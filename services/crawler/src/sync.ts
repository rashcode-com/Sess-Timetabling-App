import fs from 'node:fs';
import path from 'node:path';
import { SemesterData, SemesterDataSchema } from '@sess/core';
import { logger } from './logger.js';

/**
 * Validates and exports dataset into formatted JSON with 4-space indentation.
 */
export async function saveDatasetAsJson(
  dataset: SemesterData,
  outputPath: string
): Promise<void> {
  // Validate structure
  SemesterDataSchema.parse(dataset);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const jsonString = JSON.stringify(dataset, null, 4);
  fs.writeFileSync(outputPath, jsonString, 'utf-8');
  logger.success(`Dataset saved successfully to: ${outputPath}`);
}

/**
 * Syncs the dataset to @sess/api POST /api/sync endpoint.
 */
export async function syncToApi(
  dataset: SemesterData,
  apiUrl: string,
  syncToken?: string
): Promise<boolean> {
  const endpoint = `${apiUrl.replace(/\/$/, '')}/api/sync`;
  logger.info(`Syncing dataset to API gateway at: ${endpoint}...`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (syncToken) {
    headers['X-Sync-Token'] = syncToken;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(dataset),
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
