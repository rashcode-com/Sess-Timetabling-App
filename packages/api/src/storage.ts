import type { Context } from 'hono';
import type { AppEnv } from './types.js';
import type { SemesterData } from '@sess/core';
import { resolveDataFilePath } from './paths.js';
import fs from 'node:fs';
import path from 'node:path';

const KV_KEY = 'semester_data';

// In-memory fallback / cache for Node runtime
let cachedData: SemesterData | null = null;

/**
 * Universal getter for SemesterData.
 * Checks Cloudflare KV first, then in-memory cache, then fallback file paths on Node.js.
 */
export async function getSemesterData(c: Context<AppEnv>): Promise<SemesterData | null> {
  // 1. Try Cloudflare KV if bound
  if (c.env?.DATA_KV) {
    try {
      const dataStr = await c.env.DATA_KV.get(KV_KEY);
      if (dataStr) {
        return JSON.parse(dataStr) as SemesterData;
      }
    } catch (err) {
      console.warn('Error reading from DATA_KV:', err);
    }
  }

  // 2. Return in-memory cached data if available
  if (cachedData) {
    return cachedData;
  }

  // 3. Node.js local filesystem fallback (using layered cascade path resolution)
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const filePath = resolveDataFilePath();
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        cachedData = JSON.parse(content) as SemesterData;
        return cachedData;
      } catch (err) {
        console.warn(`Failed to parse local dataset at ${filePath}:`, err);
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
  cachedData = data;

  let savedToKv = false;

  // 1. Save to Cloudflare KV
  if (c.env?.DATA_KV) {
    try {
      await c.env.DATA_KV.put(KV_KEY, jsonStr);
      savedToKv = true;
    } catch (err) {
      console.error('Error writing to DATA_KV:', err);
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
      console.warn('Could not write dataset to Node local file:', err);
    }
  }

  return savedToKv || cachedData !== null;
}
