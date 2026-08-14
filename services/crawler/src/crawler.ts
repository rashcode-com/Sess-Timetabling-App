import { chromium, Browser, Page, Locator } from 'playwright';
import { Course, SemesterData } from '@sess/core';
import { CrawlerConfig } from './config.js';
import { logger } from './logger.js';
import { arabicToPersian, buildCourseRecord } from './parser.js';

/**
 * Clicks element safely with JS fallback.
 */
export async function safeClick(page: Page, selectorOrLocator: string | Locator, timeout = 15000): Promise<boolean> {
  const locator = typeof selectorOrLocator === 'string' ? page.locator(selectorOrLocator) : selectorOrLocator;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      await locator.click({ timeout: 5000 });
      return true;
    } catch {
      try {
        await locator.evaluate((el: HTMLElement) => el.click());
        return true;
      } catch {
        await page.waitForTimeout(500);
      }
    }
  }
  return false;
}

/**
 * Logs into the SESS system with auto-retry.
 */
export async function loginToSess(page: Page, config: CrawlerConfig, maxRetries = 3): Promise<void> {
  if (!config.username || !config.password) {
    throw new Error('SESS_USERNAME and SESS_PASSWORD must be provided in .env or arguments.');
  }

  const url = config.sessUrl;
  logger.info(`Navigating to login page: ${url}`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Fill username
      const userField = page.locator('input[name="edId"], #edId').first();
      await userField.waitFor({ state: 'visible', timeout: 15000 });
      await userField.fill(config.username);

      // Fill password
      const passField = page.locator('#edPass, input[type="password"]').first();
      await passField.waitFor({ state: 'visible', timeout: 15000 });
      await passField.fill(config.password);

      // Click login button
      const loginBtn = page.locator('#edEnter, input[type="submit"], button:has-text("ورود")').first();
      await loginBtn.click();

      // Wait for URL change or portal navigation
      await page.waitForFunction(
        (initialUrl) => window.location.href !== initialUrl || window.location.href.toLowerCase().includes('sess'),
        url,
        { timeout: 20000 }
      );

      logger.success('✅ Login successful.');
      return;
    } catch (err: any) {
      logger.warn(`⚠️ Login attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt === maxRetries) {
        throw new Error(`Failed to login to SESS after ${maxRetries} attempts: ${err.message}`);
      }
      await page.waitForTimeout(2000);
    }
  }
}

/**
 * Navigates to the semester schedule selection page.
 */
export async function navigateToSchedulePage(page: Page, semesterValue?: string, maxRetries = 3): Promise<void> {
  const hasSemesterDropdown = (await page.locator('#edSemester').count()) > 0;

  if (!hasSemesterDropdown) {
    logger.info('▶ Navigating through sidebar menu...');
    
    // 1. Click "سایر امور"
    const otherAffairs = page.locator("//h1[normalize-space()='سایر امور']/ancestor::div[2]").or(page.locator('text=سایر امور')).first();
    const clickedOther = await safeClick(page, otherAffairs);
    if (!clickedOther) {
      throw new Error("Failed to click 'سایر امور' menu item.");
    }
    await page.waitForTimeout(500);

    // 2. Click "آموزشی"
    const educationMenu = page.locator("label[for='group-3']").or(page.locator('text=آموزشی')).first();
    const clickedEdu = await safeClick(page, educationMenu);
    if (!clickedEdu) {
      throw new Error("Failed to click 'آموزشی' submenu.");
    }
    await page.waitForTimeout(500);

    // 3. Click "برنامه کلاسي نيمسال"
    const scheduleLink = page.locator("//a[normalize-space()='برنامه کلاسي نيمسال']").or(page.locator('a:has-text("برنامه کلاسي نيمسال")')).first();
    const clickedSchedule = await safeClick(page, scheduleLink);
    if (!clickedSchedule) {
      throw new Error("Failed to click 'برنامه کلاسي نيمسال' link.");
    }
  }

  const semesterDropdown = page.locator('#edSemester');
  await semesterDropdown.waitFor({ state: 'visible', timeout: 20000 });

  // Read all available semester options
  const options = await semesterDropdown.locator('option').evaluateAll((opts: HTMLOptionElement[]) =>
    opts.map((o) => ({ value: o.value.trim(), text: o.text.trim(), selected: o.selected }))
  );

  const availableList = options.map((o) => `[${o.value}: ${o.text}]`).join(', ');
  logger.info(`Available semesters in portal: ${availableList}`);

  if (semesterValue) {
    const targetVal = String(semesterValue).trim();
    const matched = options.find((o) => o.value === targetVal || o.text.includes(targetVal));

    if (matched) {
      logger.info(`▶ Selecting semester ${matched.value} (${matched.text})...`);
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await semesterDropdown.selectOption({ value: matched.value });
          logger.success(`✅ Selected semester: ${matched.value}`);
          await page.waitForTimeout(1500);
          return;
        } catch (err: any) {
          if (attempt === maxRetries) {
            throw new Error(`Failed to select semester ${matched.value}: ${err.message}`);
          }
          await page.waitForTimeout(1000);
        }
      }
    } else {
      const activeOption = options.find((o) => o.selected) || options[0];
      logger.warn(
        `⚠️ Semester value "${semesterValue}" not found in dropdown! Falling back to active portal semester: ${activeOption?.value} (${activeOption?.text})`
      );
      if (activeOption) {
        await semesterDropdown.selectOption({ value: activeOption.value });
        logger.success(`✅ Active semester in use: ${activeOption.value}`);
      }
    }
  } else {
    const activeOption = options.find((o) => o.selected) || options[0];
    logger.info(`▶ Using current active semester: ${activeOption?.value} (${activeOption?.text})`);
  }
}

/**
 * Scrapes single course details from current course details page.
 */
export async function getCourseDetails(page: Page): Promise<{ compositeId: string; course: Course }> {
  const elementIds = [
    'edName',
    'edTotalUnit',
    'edGroup',
    'edTch',
    'edSex',
    'edUnit',
    'edTimeInWeek',
    'edTimeRoom',
    'edMidDate',
    'edMidTime',
    'edCapacity',
    'edSrl',
    'edFinalTime',
    'edFinalDate',
  ];

  const rawInputs: Record<string, string> = {};

  for (const id of elementIds) {
    try {
      const loc = page.locator(`#${id}`).first();
      if ((await loc.count()) > 0) {
        // Try textContent first, fallback to value attribute
        const text = await loc.textContent();
        if (text && text.trim()) {
          rawInputs[id] = text.trim();
        } else {
          const val = await loc.getAttribute('value');
          rawInputs[id] = val ? val.trim() : '';
        }
      } else {
        rawInputs[id] = '';
      }
    } catch {
      rawInputs[id] = '';
    }
  }

  return buildCourseRecord(rawInputs);
}

/**
 * Scrapes all courses for a single department.
 */
export async function scrapeSingleDepartment(
  page: Page,
  departmentIndex: number
): Promise<{ departmentName: string; courses: Record<string, Course> }> {
  const deptSelect = page.locator('#edDepartment');
  await deptSelect.waitFor({ state: 'visible', timeout: 10000 });

  // Get department name from option label
  let departmentName = `Department_${departmentIndex}`;
  try {
    const rawName = await deptSelect.locator('option').nth(departmentIndex).textContent();
    if (rawName) {
      departmentName = arabicToPersian(rawName.trim());
    }
  } catch {
    // fallback to generic name
  }

  try {
    await deptSelect.selectOption({ index: departmentIndex });
    const displayBtn = page.locator('#edDisplay');
    await displayBtn.waitFor({ state: 'visible', timeout: 10000 });
    await displayBtn.click();
    await page.waitForTimeout(1500);
  } catch (err: any) {
    logger.error(`❌ Failed to select department index ${departmentIndex}: ${err.message}`);
    return { departmentName, courses: {} };
  }

  const courseRowsLocator = page.locator('tr.listOdd, tr.listEven');
  const numCourses = await courseRowsLocator.count();
  logger.step(departmentName, `Scanning ${numCourses} courses found...`);

  const departmentCourses: Record<string, Course> = {};

  for (let i = 0; i < numCourses; i++) {
    let retries = 2;
    while (retries > 0) {
      try {
        const rows = page.locator('tr.listOdd, tr.listEven');
        const row = rows.nth(i);
        await row.waitFor({ state: 'visible', timeout: 5000 });
        await row.click();

        // Wait for details page and scrape
        await page.locator('#edName, #edSrl').first().waitFor({ state: 'visible', timeout: 8000 });
        const { compositeId, course } = await getCourseDetails(page);
        departmentCourses[compositeId] = course;

        // Navigate back
        await page.goBack();
        await page.locator('#edDepartment').waitFor({ state: 'visible', timeout: 8000 });
        break;
      } catch (err: any) {
        retries--;
        logger.warn(`⚠️ Stale element or timeout on course ${i + 1}/${numCourses}, retrying...`);
        try {
          await page.goBack();
          await page.locator('#edDepartment').waitFor({ state: 'visible', timeout: 8000 });
          await page.locator('#edDepartment').selectOption({ index: departmentIndex });
          await page.locator('#edDisplay').click();
          await page.waitForTimeout(1000);
        } catch {
          // pass recovery
        }
        if (retries === 0) {
          logger.error(`❌ Failed to scrape course ${i + 1} in ${departmentName}: ${err.message}`);
        }
      }
    }
  }

  // Ensure returned to department selection view
  try {
    if ((await page.locator('#edDepartment').count()) === 0) {
      await page.goBack();
      await page.locator('#edDepartment').waitFor({ state: 'visible', timeout: 8000 });
    }
  } catch {
    // Ignore
  }

  return { departmentName, courses: departmentCourses };
}

/**
 * Main Crawler Runner: launches browser, navigates, iterates over departments, and produces SemesterData.
 */
export async function runCrawler(
  config: CrawlerConfig,
  options: { departmentIndex?: number; dryRun?: boolean } = {}
): Promise<SemesterData> {
  const browserName = config.browserChannel || 'Default Playwright Chromium';
  logger.info(`Launching browser: ${browserName} (headless: ${config.headless})`);

  const browser: Browser = await chromium.launch({
    ...(config.browserChannel ? { channel: config.browserChannel } : {}),
    headless: config.headless,
    slowMo: config.headless ? 0 : 50,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'fa-IR',
  });

  const page = await context.newPage();

  try {
    // 1. Login
    await loginToSess(page, config);

    // 2. Navigate to Schedule Page
    await navigateToSchedulePage(page, config.semesterValue);

    // 3. Inspect Departments
    const deptSelect = page.locator('#edDepartment');
    await deptSelect.waitFor({ state: 'visible', timeout: 15000 });
    
    // Read all department options with index and normalized Persian text
    const rawOptions = await deptSelect.locator('option').evaluateAll((opts: HTMLOptionElement[]) =>
      opts.map((o, idx) => ({ index: idx, value: o.value, text: o.text.trim() }))
    );

    const totalDepartments = rawOptions.length;
    logger.info(`Found ${totalDepartments} total departments in dropdown.`);

    const allDepartmentsData: SemesterData = {};

    if (options.departmentIndex !== undefined) {
      // Scrape single department by explicit index
      const idx = options.departmentIndex;
      logger.info(`Scraping single department at index: ${idx}`);
      const { departmentName, courses } = await scrapeSingleDepartment(page, idx);
      if (Object.keys(courses).length > 0) {
        allDepartmentsData[departmentName] = courses;
      }
    } else if (config.departments && config.departments.length > 0) {
      // Filter departments by names provided in config / .env (with Arabic/Persian normalization)
      const targetDeptNames = config.departments.map((d) => arabicToPersian(d).trim().toLowerCase());
      logger.info(`Filtering departments by configured names: ${config.departments.join(', ')}`);

      const matchedOptions = rawOptions.filter((opt) => {
        // Skip dummy/empty options like "--" or value="0"
        if (!opt.value || opt.value === '0' || opt.text === '--') return false;

        const normalizedOptText = arabicToPersian(opt.text).trim().toLowerCase();
        return targetDeptNames.some((target) => normalizedOptText.includes(target) || target.includes(normalizedOptText));
      });

      if (matchedOptions.length === 0) {
        logger.warn('⚠️ No matching departments found for the specified names! Please check DEPARTMENTS in .env');
      } else {
        logger.info(`Found ${matchedOptions.length} matching department(s) to scrape.`);
        for (let i = 0; i < matchedOptions.length; i++) {
          const opt = matchedOptions[i];
          logger.step(`Progress`, `Scraping matched department [${opt.index}]: ${opt.text} (${i + 1}/${matchedOptions.length})...`);
          const { departmentName, courses } = await scrapeSingleDepartment(page, opt.index);
          if (Object.keys(courses).length > 0) {
            allDepartmentsData[departmentName] = courses;
          }
          await page.waitForTimeout(config.concurrencyDelayMs);
        }
      }
    } else if (options.dryRun) {
      // Dry-run: scrape first 2 valid departments (skipping index 0 if value="0")
      logger.info('Dry-run mode enabled: Scraping first 2 departments...');
      const validOptions = rawOptions.filter((o) => o.value && o.value !== '0' && o.text !== '--');
      const limit = Math.min(2, validOptions.length);
      for (let i = 0; i < limit; i++) {
        const { departmentName, courses } = await scrapeSingleDepartment(page, validOptions[i].index);
        if (Object.keys(courses).length > 0) {
          allDepartmentsData[departmentName] = courses;
        }
      }
    } else {
      // Scrape all departments (skipping index 0 if value="0")
      for (let i = 0; i < totalDepartments; i++) {
        const opt = rawOptions[i];
        if (opt.value === '0' || opt.text === '--') continue;

        logger.step(`Progress`, `Scraping department ${i + 1}/${totalDepartments} (${opt.text})...`);
        const { departmentName, courses } = await scrapeSingleDepartment(page, i);
        if (Object.keys(courses).length > 0) {
          allDepartmentsData[departmentName] = courses;
        }
        await page.waitForTimeout(config.concurrencyDelayMs);
      }
    }

    const deptCount = Object.keys(allDepartmentsData).length;
    let totalCourses = 0;
    for (const dept of Object.values(allDepartmentsData)) {
      totalCourses += Object.keys(dept).length;
    }
    logger.success(`🎉 Scraping complete! Scraped ${deptCount} departments with ${totalCourses} total courses.`);

    return allDepartmentsData;
  } finally {
    await browser.close();
  }
}
