#!/usr/bin/env node

/**
 * sync-dataset.mjs
 * 
 * Synchronizes the canonical dataset (packages/data/datasets/data.json)
 * into apps/web/public/data/data.json for zero-cost runtime static fetching.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

const sourcePath = path.join(workspaceRoot, 'packages/data/datasets/data.json');
const targetDir = path.join(workspaceRoot, 'apps/web/public/data');
const targetPath = path.join(targetDir, 'data.json');

function syncDataset() {
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ [sync-data] Source dataset not found at: ${sourcePath}`);
    process.exit(1);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const srcStat = fs.statSync(sourcePath);

  if (fs.existsSync(targetPath)) {
    const destStat = fs.statSync(targetPath);
    if (srcStat.size === destStat.size && srcStat.mtimeMs <= destStat.mtimeMs) {
      console.log(`✨ [sync-data] Dataset already in sync: ${path.relative(workspaceRoot, targetPath)} (${(srcStat.size / 1024 / 1024).toFixed(2)} MB)`);
      return;
    }
  }

  fs.copyFileSync(sourcePath, targetPath);
  console.log(`✅ [sync-data] Synchronized dataset: ${path.relative(workspaceRoot, sourcePath)} -> ${path.relative(workspaceRoot, targetPath)} (${(srcStat.size / 1024 / 1024).toFixed(2)} MB)`);
}

syncDataset();
