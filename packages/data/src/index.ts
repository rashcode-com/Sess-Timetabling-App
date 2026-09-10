import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SemesterData } from '@sess/core';
import { SemesterDataSchema } from '@sess/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Path to the canonical master dataset file.
 */
export const DATASET_PATH = path.resolve(__dirname, '../datasets/data.json');

/**
 * Returns the absolute path to the canonical data.json dataset.
 */
export function getDatasetPath(): string {
  return DATASET_PATH;
}

/**
 * Synchronously loads and validates the semester data from the canonical dataset.
 *
 * @throws {Error} if the file does not exist or fails schema validation.
 */
export function loadSemesterData(): SemesterData {
  if (!fs.existsSync(DATASET_PATH)) {
    throw new Error(`[data] Dataset file not found at: ${DATASET_PATH}`);
  }

  const raw = fs.readFileSync(DATASET_PATH, 'utf-8');
  const json = JSON.parse(raw);
  return SemesterDataSchema.parse(json);
}

/**
 * Dataset metadata information.
 */
export const METADATA = {
  defaultSemester: '1402-1',
  packageVersion: '0.1.0',
} as const;
