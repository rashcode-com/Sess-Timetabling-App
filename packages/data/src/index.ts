import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SemesterData, UnifiedCatalog } from '@sess/core';
import { SemesterDataSchema, UnifiedCatalogSchema } from '@sess/core';

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
 * Synchronously loads and validates the entire unified multi-semester catalog.
 *
 * @throws {Error} if the file does not exist or fails schema validation.
 */
export function loadCatalogData(): UnifiedCatalog {
  if (!fs.existsSync(DATASET_PATH)) {
    throw new Error(`[data] Dataset file not found at: ${DATASET_PATH}`);
  }

  const raw = fs.readFileSync(DATASET_PATH, 'utf-8');
  const json = JSON.parse(raw);

  if (json && typeof json === 'object' && 'semesters' in json) {
    return UnifiedCatalogSchema.parse(json);
  }

  // Fallback for legacy flat dataset
  const parsedFlat = SemesterDataSchema.parse(json);
  return {
    updated_at: new Date().toISOString(),
    active_semester: 'default',
    semesters: {
      default: parsedFlat,
    },
  };
}

/**
 * Synchronously loads and validates semester data (departments -> courses)
 * for a specific semester or the active semester.
 *
 * @throws {Error} if the file does not exist or fails schema validation.
 */
export function loadSemesterData(targetSemester?: string): SemesterData {
  if (!fs.existsSync(DATASET_PATH)) {
    throw new Error(`[data] Dataset file not found at: ${DATASET_PATH}`);
  }

  const raw = fs.readFileSync(DATASET_PATH, 'utf-8');
  const json = JSON.parse(raw);

  if (json && typeof json === 'object' && 'semesters' in json) {
    const catalog = UnifiedCatalogSchema.parse(json);
    const available = Object.keys(catalog.semesters);
    const sem = targetSemester || catalog.active_semester || available[0] || 'default';
    const semData = catalog.semesters[sem];
    if (!semData) {
      throw new Error(`[data] Semester "${sem}" not found in catalog. Available: ${available.join(', ')}`);
    }
    return semData;
  }


  // Legacy flat dataset
  return SemesterDataSchema.parse(json);
}

/**
 * Dataset metadata information.
 */
export const METADATA = {
  packageVersion: '0.1.0',
} as const;

