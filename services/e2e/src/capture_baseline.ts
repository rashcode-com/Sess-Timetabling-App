import { chromium } from 'playwright';
import { serve } from '@hono/node-server';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { findWorkspaceRoot, resolveWebDistPath } from '../../../packages/api/src/paths.js';
import rootApp from '../../../packages/api/src/node.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SNAPSHOTS_DIR = path.resolve(__dirname, '../snapshots/baseline');
const TEST_PORT = Number(process.env.TEST_PORT) || 3100;
const LOCAL_URL = `http://localhost:${TEST_PORT}`;

// Ensure output directory exists
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

console.log('🚀 SESS Web Modernization - Visual Baseline Capture');
console.log(`📂 Output Directory: ${SNAPSHOTS_DIR}`);

// Verify built frontend dist
const webDistPath = resolveWebDistPath();
if (!webDistPath || !fs.existsSync(path.join(webDistPath, 'index.html'))) {
  console.error('❌ Error: Built web frontend not found in apps/web/dist.');
  console.error('👉 Please build the web application first using: pnpm web:build (or pnpm build)');
  process.exit(1);
}
console.log(`📦 Serving Built Web Frontend from: ${webDistPath}`);

async function run() {
  // Start local Hono server
  console.log(`🌐 Starting local Hono.js server on ${LOCAL_URL}...`);
  const server = serve({
    fetch: rootApp.fetch,
    port: TEST_PORT,
  });

  // Allow server a brief moment to bind
  await new Promise((resolve) => setTimeout(resolve, 300));

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'fa-IR',
  });

  const page = await context.newPage();

  try {
    console.log(`⏳ Navigating to local Hono server (${LOCAL_URL})...`);
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500); // Allow Vue and data.json to hydrate

    // ----------------------------------------------------
    // FLOW 1: Filter & Search -> Data Table & Pagination
    // ----------------------------------------------------
    console.log('\n📸 [Flow 1/5] Executing Filter & Search...');
    
    // Ensure drawer is open
    const drawer = page.locator('.v-navigation-drawer');
    const isDrawerVisible = await drawer.isVisible();
    if (!isDrawerVisible) {
      await page.locator('.outNavToggler').first().click();
      await page.waitForTimeout(500);
    }

    // Select Semester (first autocomplete)
    const semesterInput = page.locator('.v-autocomplete').nth(0);
    await semesterInput.click();
    await page.waitForTimeout(400);
    const semesterOption = page.locator('.v-menu__content .v-list-item').first();
    if (await semesterOption.isVisible()) {
      await semesterOption.click();
      await page.waitForTimeout(300);
    }

    // Select Department / Unit (second autocomplete)
    const unitInput = page.locator('.v-autocomplete').nth(1);
    await unitInput.click();
    await page.waitForTimeout(400);
    const unitOption = page.locator('.v-menu__content .v-list-item').first();
    if (await unitOption.isVisible()) {
      await unitOption.click();
      await page.waitForTimeout(300);
    }
    // Close dropdown
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // Click Search Button
    const searchBtn = page.locator('.v-navigation-drawer .v-btn:has-text("جستجو")');
    await searchBtn.click();
    await page.waitForSelector('.v-data-table tbody tr', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Capture Flow 1: Search Results Desktop
    const shot1Path = path.join(SNAPSHOTS_DIR, '01_search_results_desktop.png');
    await page.screenshot({ path: shot1Path, fullPage: false });
    console.log(`  ✅ Saved: 01_search_results_desktop.png`);

    // ----------------------------------------------------
    // FLOW 2: Course Selection & Calendar View
    // ----------------------------------------------------
    console.log('\n📸 [Flow 2/5] Selecting Courses & Viewing Calendar...');

    // Select first 2 courses from table
    const checkBoxes = page.locator('.v-data-table tbody tr .v-simple-checkbox');
    const count = await checkBoxes.count();
    console.log(`  Found ${count} course rows`);
    if (count > 0) {
      await checkBoxes.nth(0).click();
      await page.waitForTimeout(400);
    }
    if (count > 1) {
      await checkBoxes.nth(1).click();
      await page.waitForTimeout(400);
    }

    // Wait for calendar shower container to appear after selection
    await page.waitForSelector('.calenderShower', { timeout: 5000 });
    console.log('  Calendar container is visible, clicking chevron icon...');

    // Click the toggle icon inside calenderShower
    const calendarToggleIcon = page.locator('.calenderShower .v-icon.mdi-chevron-down, .calenderShower i');
    await calendarToggleIcon.first().click({ force: true });
    await page.waitForTimeout(1000);

    // Wait for calendar sheet to be visible
    await page.waitForSelector('.theCalender .v-sheet, .theCalender .v-calendar', { timeout: 5000 });
    await page.waitForTimeout(800);

    // Capture Flow 2: Calendar Schedule
    const shot2Path = path.join(SNAPSHOTS_DIR, '02_calendar_schedule.png');
    await page.screenshot({ path: shot2Path, fullPage: false });
    console.log(`  ✅ Saved: 02_calendar_schedule.png`);

    // Click on a calendar event to show popover if available
    const calendarEvents = page.locator('.v-event-timed, .v-event, .theCalender .v-sheet--tile');
    if (await calendarEvents.count() > 0) {
      await calendarEvents.first().click({ force: true });
      await page.waitForTimeout(600);
      const shot2PopPath = path.join(SNAPSHOTS_DIR, '02_calendar_event_popover.png');
      await page.screenshot({ path: shot2PopPath, fullPage: false });
      console.log(`  ✅ Saved: 02_calendar_event_popover.png`);
      
      // Close popover
      const closePopBtn = page.locator('.v-menu__content .v-card .v-btn:has-text("بستن")');
      if (await closePopBtn.isVisible()) {
        await closePopBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // ----------------------------------------------------
    // FLOW 3: Clash Conflict Detection & Modal
    // ----------------------------------------------------
    console.log('\n📸 [Flow 3/5] Triggering Course Clash & Capturing Modal...');

    // Select more courses from the table to trigger a clash
    for (let i = 2; i < Math.min(count, 10); i++) {
      await checkBoxes.nth(i).click();
      await page.waitForTimeout(300);
      
      const snackbar = page.locator('.v-snack--active, .v-snackbar:has-text("تداخل")');
      if (await snackbar.count() > 0 && await snackbar.first().isVisible()) {
        console.log('  ⚠️ Course clash detected!');
        break;
      }
    }

    // Open Clash Details Dialog
    const detailBtn = page.locator('.v-snack--active .v-btn:has-text("جزئیات"), .v-badge .v-btn').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await page.waitForSelector('.v-dialog--active', { timeout: 5000 });
      await page.waitForTimeout(600);

      // Capture Flow 3: Clash Modal
      const shot3Path = path.join(SNAPSHOTS_DIR, '03_clash_snackbar_and_modal.png');
      await page.screenshot({ path: shot3Path, fullPage: false });
      console.log(`  ✅ Saved: 03_clash_snackbar_and_modal.png`);

      // Close Clash Dialog
      const closeClashBtn = page.locator('.v-dialog--active .v-btn:has-text("بستن")');
      if (await closeClashBtn.isVisible()) {
        await closeClashBtn.click();
        await page.waitForTimeout(400);
      }
    }

    // ----------------------------------------------------
    // FLOW 4: Course Details Modal
    // ----------------------------------------------------
    console.log('\n📸 [Flow 4/5] Opening Selected Courses Tab & Course Details...');

    // Ensure drawer is open
    if (!await drawer.isVisible()) {
      await page.locator('.outNavToggler').first().click();
      await page.waitForTimeout(500);
    }

    // Switch to "دروس انتخاب شده" tab in drawer
    const selectedTab = page.locator('.v-navigation-drawer .v-tab').nth(1);
    if (await selectedTab.isVisible()) {
      await selectedTab.click();
      await page.waitForTimeout(500);

      // Click info icon on first selected item
      const infoBtn = page.locator('.class-list-card .v-icon.mdi-information').first();
      if (await infoBtn.isVisible()) {
        await infoBtn.click();
        await page.waitForSelector('.v-dialog--active', { timeout: 5000 });
        await page.waitForTimeout(600);

        // Capture Flow 4: Course Details Modal
        const shot4Path = path.join(SNAPSHOTS_DIR, '04_course_details_modal.png');
        await page.screenshot({ path: shot4Path, fullPage: false });
        console.log(`  ✅ Saved: 04_course_details_modal.png`);

        // Close Course Details Dialog
        const closeDetailsBtn = page.locator('.v-dialog--active .v-btn:has-text("بستن")');
        if (await closeDetailsBtn.isVisible()) {
          await closeDetailsBtn.click();
          await page.waitForTimeout(400);
        }
      }
    }

    // ----------------------------------------------------
    // FLOW 5: Mobile Viewport & Responsive Drawer/Table
    // ----------------------------------------------------
    console.log('\n📸 [Flow 5/5] Resizing to Mobile Viewport (375x812)...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(800);

    // Switch back to Filter tab in drawer
    const filterTab = page.locator('.v-navigation-drawer .v-tab').nth(0);
    if (await filterTab.isVisible()) {
      await filterTab.click();
      await page.waitForTimeout(400);
    }

    // Capture Mobile with Drawer
    const shot5DrawerPath = path.join(SNAPSHOTS_DIR, '05_mobile_drawer.png');
    await page.screenshot({ path: shot5DrawerPath, fullPage: false });
    console.log(`  ✅ Saved: 05_mobile_drawer.png`);

    // Toggle/Close Drawer on mobile to capture table layout
    const drawerCloseIcon = page.locator('.v-navigation-drawer .v-app-bar-nav-icon, .outNavToggler').first();
    if (await drawerCloseIcon.isVisible()) {
      await drawerCloseIcon.click({ force: true });
      await page.waitForTimeout(600);
    }

    // Scroll down to show table
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(400);

    // Capture Mobile Table Stacked
    const shot5TablePath = path.join(SNAPSHOTS_DIR, '05_mobile_table_stacked.png');
    await page.screenshot({ path: shot5TablePath, fullPage: false });
    console.log(`  ✅ Saved: 05_mobile_table_stacked.png`);

    console.log('\n🎉 All baseline snapshots captured successfully in:');
    console.log(`👉 ${SNAPSHOTS_DIR}`);

  } catch (error) {
    console.error('❌ Error during baseline capture:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
    console.log('🛑 Local Hono server stopped.');
  }
}

run();
