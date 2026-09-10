import type { Context } from 'hono';
import type { AppEnv } from './types.js';
import type { SemesterData, UnifiedCatalog } from '@sess/core';
import { resolveDataFilePath, findWorkspaceRoot } from './paths.js';
import fs from 'node:fs';
import path from 'node:path';

const KV_KEY = 'semester_data';
const ISOLATE_CACHE_TTL_MS = 60 * 1000; // 60s in-memory TTL to balance performance & KV freshness

// In-memory isolate cache for Worker and Node runtimes
let isolateCache: { catalog: UnifiedCatalog; timestamp: number } | null = null;

function normalizeToCatalog(data: any): UnifiedCatalog {
  if (data && typeof data === 'object' && 'semesters' in data) {
    const available = Object.keys(data.semesters || {});
    const active = data.active_semester || available[0] || 'default';
    return {
      updated_at: data.updated_at || new Date().toISOString(),
      active_semester: active,
      semesters: data.semesters || {},
    };
  }
  return {
    updated_at: new Date().toISOString(),
    active_semester: 'default',
    semesters: {
      default: data as SemesterData,
    },
  };
}


/**
 * Universal getter for UnifiedCatalog.
 * Checks isolate in-memory cache first, then Cloudflare KV (with cacheTtl), then fallback file paths on Node.js.
 */
export async function getCatalogData(c: Context<AppEnv>): Promise<UnifiedCatalog | null> {
  const now = Date.now();

  // 1. Return in-memory isolate cached data if still fresh
  if (isolateCache && (now - isolateCache.timestamp < ISOLATE_CACHE_TTL_MS)) {
    return isolateCache.catalog;
  }

  // 2. Try Cloudflare KV if bound
  if (c.env?.DATA_KV) {
    try {
      const dataStr = await c.env.DATA_KV.get(KV_KEY, { cacheTtl: 300 });
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        const catalog = normalizeToCatalog(parsed);
        isolateCache = { catalog, timestamp: now };
        return catalog;
      }
    } catch (err) {
      console.warn(JSON.stringify({
        level: 'warn',
        message: 'Error reading from DATA_KV',
        error: err instanceof Error ? err.message : String(err)
      }));
    }
  }

  // 3. Fallback to existing isolate cache even if slightly stale when KV is empty or failed
  if (isolateCache) {
    return isolateCache.catalog;
  }

  // 4. Node.js local filesystem fallback (using layered cascade path resolution)
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const filePath = resolveDataFilePath();
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        const catalog = normalizeToCatalog(parsed);
        isolateCache = { catalog, timestamp: now };
        return catalog;
      } catch (err) {
        console.warn(JSON.stringify({
          level: 'warn',
          message: `Failed to parse local dataset at ${filePath}`,
          error: err instanceof Error ? err.message : String(err)
        }));
      }
    }
  }

  return null;
}

/**
 * Universal getter for SemesterData (for a specific semester or the active semester).
 */
export async function getSemesterData(c: Context<AppEnv>, targetSemester?: string): Promise<SemesterData | null> {
  const catalog = await getCatalogData(c);
  if (!catalog) return null;

  const sem = targetSemester || catalog.active_semester;
  return catalog.semesters[sem] || null;
}

/**
 * Universal setter for SemesterData or UnifiedCatalog.
 * Writes to Cloudflare KV if bound, and updates in-memory cache / local file on Node.js.
 */
export async function saveSemesterData(
  c: Context<AppEnv>,
  data: SemesterData | UnifiedCatalog,
  semester?: string
): Promise<boolean> {
  let catalogToSave: UnifiedCatalog;

  if ('semesters' in data && 'active_semester' in data) {
    catalogToSave = data as UnifiedCatalog;
  } else {
    const existing = await getCatalogData(c);
    const targetSemester = semester || existing?.active_semester || 'default';
    catalogToSave = {
      updated_at: new Date().toISOString(),
      active_semester: targetSemester,
      semesters: {
        ...(existing ? existing.semesters : {}),
        [targetSemester]: data as SemesterData,
      },
    };
  }


  const jsonStr = JSON.stringify(catalogToSave, null, 4);
  isolateCache = { catalog: catalogToSave, timestamp: Date.now() };

  let savedToKv = false;

  // 1. Save to Cloudflare KV
  if (c.env?.DATA_KV) {
    try {
      await c.env.DATA_KV.put(KV_KEY, jsonStr);
      savedToKv = true;
    } catch (err) {
      console.error(JSON.stringify({
        level: 'error',
        message: 'Error writing to DATA_KV',
        error: err instanceof Error ? err.message : String(err)
      }));
    }
  }

  // 2. Save to Node.js filesystem if running under Node
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      const targetPath = resolveDataFilePath();
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(targetPath, jsonStr, 'utf-8');

      // Also sync to apps/web/dist if in monorepo environment with built frontend
      const root = findWorkspaceRoot();
      if (root) {
        const distTarget = path.join(root, 'apps/web/dist/data/data.json');
        if (distTarget !== targetPath && fs.existsSync(path.dirname(distTarget))) {
          try {
            fs.writeFileSync(distTarget, jsonStr, 'utf-8');
          } catch {
            // Ignore non-critical sync errors
          }
        }
      }
    } catch (err) {
      console.warn(JSON.stringify({
        level: 'warn',
        message: 'Could not write dataset to Node local file',
        error: err instanceof Error ? err.message : String(err)
      }));
    }
  }

  return savedToKv || isolateCache !== null;
}


