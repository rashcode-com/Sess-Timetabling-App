import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Gets the directory name of the current ESM module across all Node.js versions.
 */
function getCurrentDir(): string {
  if (typeof import.meta.dirname !== 'undefined') {
    return import.meta.dirname;
  }
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
}

/**
 * Searches upward from the current module or process.cwd to find the monorepo workspace root.
 * Markers: 'pnpm-workspace.yaml', 'turbo.json', '.git'.
 */
export function findWorkspaceRoot(fromDir?: string): string | null {
  const startDir = fromDir || getCurrentDir();
  let current = path.resolve(startDir);

  while (current !== path.dirname(current)) {
    const isPnpmRoot = fs.existsSync(path.join(current, 'pnpm-workspace.yaml'));
    const isTurboRoot = fs.existsSync(path.join(current, 'turbo.json'));
    const isGitRoot = fs.existsSync(path.join(current, '.git'));

    if (isPnpmRoot || isTurboRoot || isGitRoot) {
      return current;
    }
    current = path.dirname(current);
  }

  // Also check from process.cwd if startDir didn't find anything
  if (!fromDir && process.cwd() !== startDir) {
    let cwdCurrent = path.resolve(process.cwd());
    while (cwdCurrent !== path.dirname(cwdCurrent)) {
      if (
        fs.existsSync(path.join(cwdCurrent, 'pnpm-workspace.yaml')) ||
        fs.existsSync(path.join(cwdCurrent, 'turbo.json')) ||
        fs.existsSync(path.join(cwdCurrent, '.git'))
      ) {
        return cwdCurrent;
      }
      cwdCurrent = path.dirname(cwdCurrent);
    }
  }

  return null;
}

/**
 * Resolves the path to apps/web/dist for static SPA serving.
 * 
 * Layered Cascade Strategy:
 * 1. Environment Variable: process.env.WEB_DIST_PATH or process.env.STATIC_DIR
 * 2. Monorepo Root: <workspace-root>/apps/web/dist
 * 3. Module/CWD Fallback: ./dist, apps/web/dist relative to cwd
 */
export function resolveWebDistPath(): string | null {
  // Layer 1: Environment Variable (12-Factor App & Docker/Tauri injection)
  const envPath = process.env.WEB_DIST_PATH || process.env.STATIC_DIR;
  if (envPath) {
    const resolvedEnv = path.resolve(envPath);
    if (fs.existsSync(resolvedEnv) && fs.existsSync(path.join(resolvedEnv, 'index.html'))) {
      return resolvedEnv;
    }
  }

  // Layer 2: Monorepo Workspace Root
  const root = findWorkspaceRoot();
  if (root) {
    const monorepoWebDist = path.join(root, 'apps/web/dist');
    if (fs.existsSync(monorepoWebDist) && fs.existsSync(path.join(monorepoWebDist, 'index.html'))) {
      return monorepoWebDist;
    }
  }

  // Layer 3: Standalone / Local CWD Fallback
  const fallbacks = [
    path.resolve(process.cwd(), 'apps/web/dist'),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(getCurrentDir(), '../web/dist'),
    path.resolve(getCurrentDir(), '../../apps/web/dist')
  ];

  for (const candidate of fallbacks) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }

  return null;
}

/**
 * Resolves the path to the primary data.json dataset for reading and writing.
 * 
 * Layered Cascade Strategy:
 * 1. Environment Variable: process.env.DATA_FILE_PATH
 * 2. Monorepo Root: <workspace-root>/apps/web/src/data/data.json
 * 3. Module/CWD Fallback: relative to cwd or module
 */
export function resolveDataFilePath(): string {
  // Layer 1: Environment Variable
  const envDataPath = process.env.DATA_FILE_PATH;
  if (envDataPath) {
    return path.resolve(envDataPath);
  }

  // Layer 2: Monorepo Workspace Root
  const root = findWorkspaceRoot();
  if (root) {
    return path.join(root, 'apps/web/src/data/data.json');
  }

  // Layer 3: Local CWD Fallbacks
  const candidateReads = [
    path.resolve(process.cwd(), 'apps/web/src/data/data.json'),
    path.resolve(process.cwd(), 'data/data.json'),
    path.resolve(process.cwd(), 'data.json'),
    path.resolve(getCurrentDir(), '../../apps/web/src/data/data.json')
  ];

  for (const candidate of candidateReads) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidateReads[0];
}
