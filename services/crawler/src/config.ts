import path from 'node:path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export interface CrawlerConfig {
  sessUrl: string;
  username?: string;
  password?: string;
  semesterValue?: string;
  departments?: string[];
  headless: boolean;
  browserChannel?: string;
  outputPath: string;
  apiUrl: string;
  syncToken?: string;
  concurrencyDelayMs: number;
}

export function loadConfig(cliOverrides: Partial<CrawlerConfig> = {}): CrawlerConfig {
  const defaultOutputPath = path.resolve(process.cwd(), '../../apps/web/src/data/data.json');

  const rawDepts = cliOverrides.departments || (process.env.DEPARTMENTS ? process.env.DEPARTMENTS.split(',').map((d) => d.trim()).filter(Boolean) : undefined);

  return {
    sessUrl: cliOverrides.sessUrl || process.env.SESS_URL || 'https://sess.sku.ac.ir/',
    username: cliOverrides.username || process.env.SESS_USERNAME,
    password: cliOverrides.password || process.env.SESS_PASSWORD,
    semesterValue: cliOverrides.semesterValue || process.env.SEMESTER_VALUE,
    departments: rawDepts && rawDepts.length > 0 ? rawDepts : undefined,
    headless: cliOverrides.headless !== undefined
      ? cliOverrides.headless
      : process.env.HEADLESS !== 'false',
    browserChannel: (() => {
      const raw = cliOverrides.browserChannel ?? process.env.BROWSER_CHANNEL;
      if (!raw || raw === 'default' || raw === 'playwright') return undefined;
      return raw.trim();
    })(),
    outputPath: cliOverrides.outputPath || process.env.OUTPUT_PATH || defaultOutputPath,
    apiUrl: cliOverrides.apiUrl || process.env.API_URL || 'http://localhost:3000',
    syncToken: cliOverrides.syncToken || process.env.SYNC_TOKEN,
    concurrencyDelayMs: cliOverrides.concurrencyDelayMs || Number(process.env.CONCURRENCY_DELAY_MS) || 100,
  };
}
