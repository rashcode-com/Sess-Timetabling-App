import type { Context } from 'hono';
import type { AppEnv } from './types.js';
import type { SemesterData } from '@sess/core';
import { resolveDataFilePath } from './paths.js';
import fs from 'node:fs';
import path from 'node:path';

const KV_KEY = 'semester_data';
const ISOLATE_CACHE_TTL_MS = 60 * 1000; // 60s in-memory TTL to balance performance & KV freshness

// In-memory isolate cache for Worker and Node runtimes
let isolateCache: { data: SemesterData; timestamp: number } | null = null;

/**
 * Universal getter for SemesterData.
 * Checks isolate in-memory cache first, then Cloudflare KV (with cacheTtl), then fallback file paths on Node.js.
 */
export async function getSemesterData(c: Context<AppEnv>): Promise<SemesterData | null> {
  const now = Date.now();

  // 1. Return in-memory isolate cached data if still fresh
  if (isolateCache && (now - isolateCache.timestamp < ISOLATE_CACHE_TTL_MS)) {
    return isolateCache.data;
  }

  // 2. Try Cloudflare KV if bound
  if (c.env?.DATA_KV) {
    try {
      const dataStr = await c.env.DATA_KV.get(KV_KEY, { cacheTtl: 300 });
      if (dataStr) {
        const parsed = JSON.parse(dataStr) as SemesterData;
        isolateCache = { data: parsed, timestamp: now };
        return parsed;
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
    return isolateCache.data;
  }

  // 4. Node.js local filesystem fallback (using layered cascade path resolution)
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const filePath = resolveDataFilePath();
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content) as SemesterData;
        isolateCache = { data: parsed, timestamp: now };
        return parsed;
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
 * Universal setter for SemesterData.
 * Writes to Cloudflare KV if bound, and updates in-memory cache / local file on Node.js.
 */
export async function saveSemesterData(c: Context<AppEnv>, data: SemesterData): Promise<boolean> {
  const jsonStr = JSON.stringify(data, null, 4);
  isolateCache = { data, timestamp: Date.now() };

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

