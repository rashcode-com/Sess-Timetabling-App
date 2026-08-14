#!/usr/bin/env node
import path from 'node:path';
import { Command } from 'commander';
import { loadConfig } from './config.js';
import { runCrawler } from './crawler.js';
import { logger } from './logger.js';
import { saveDatasetAsJson, syncToApi } from './sync.js';

import { promptMissingConfig } from './prompt.js';

const program = new Command();

program
  .name('sess-crawler')
  .description('TypeScript + Playwright crawler for Shiraz/Shahrekord University SESS portals')
  .version('0.1.0')
  .option('-u, --url <url>', 'SESS portal base URL')
  .option('-s, --semester <value>', 'Semester value (e.g. 4031)')
  .option('-b, --browser <channel>', 'Browser to use: msedge, chrome, or default (Playwright Chromium)')
  .option('-d, --department <index>', 'Scrape only a specific department by zero-based index', (val) => parseInt(val, 10))
  .option('--headed', 'Run browser in headed/visible UI mode')
  .option('--headless', 'Run browser in headless background mode')
  .option('-o, --out <path>', 'Custom output JSON file path')
  .option('--sync', 'Automatically sync the scraped dataset to @sess/api')
  .option('--api-url <url>', 'Base URL for @sess/api gateway')
  .option('--sync-token <token>', 'Authorization token for @sess/api sync endpoint')
  .option('--dry-run', 'Dry run mode: scrape only first 2 departments to test selectors')
  .action(async (options) => {
    logger.step('START', 'Initializing SESS Crawler (Phase 4)...');

    let headlessOverride: boolean | undefined = undefined;
    if (options.headless) {
      headlessOverride = true;
    } else if (options.headed) {
      headlessOverride = false;
    }

    const rawConfig = loadConfig({
      sessUrl: options.url,
      semesterValue: options.semester,
      browserChannel: options.browser,
      headless: headlessOverride,
      outputPath: options.out ? path.resolve(process.cwd(), options.out) : undefined,
      apiUrl: options.apiUrl,
      syncToken: options.syncToken,
    });

    try {
      const config = await promptMissingConfig(rawConfig);

      const dataset = await runCrawler(config, {
        departmentIndex: options.department,
        dryRun: options.dryRun,
      });

      // Export to JSON
      await saveDatasetAsJson(dataset, config.outputPath);

      // Optional sync to API
      if (options.sync) {
        await syncToApi(dataset, config.apiUrl, config.syncToken);
      }

      logger.success('🚀 Scraping and processing finished successfully!');
      process.exit(0);
    } catch (err: any) {
      logger.error(`Crawler execution failed: ${err.message}`);
      if (err.stack) {
        console.error(err.stack);
      }
      process.exit(1);
    }
  });

program.parse(process.argv);
