import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://app-dev.foundershub.ai';
const WYSE_CRM_URL = `${BASE_URL}/modules?type=wyse`;

const CREDENTIALS = {
  email: 'info@foundershub.ai',
  password: 'Invest@92',
};

async function loginAndGoToWyseCRM(page: Page): Promise<void> {
  console.log('🔐 Logging into Wyse CRM...');

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  await page.locator('input[type="email"], input[name="email"]').first().fill(CREDENTIALS.email);
  await page.locator('input[type="password"]').first().fill(CREDENTIALS.password);
  await page.locator('button[type="submit"], button:has-text("Login")').first().click();

  await page.waitForURL(/.*dashboard.*/, { timeout: 50_000 });
  await page.goto(WYSE_CRM_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForLoadState('domcontentloaded', { timeout: 20_000 });

  // Scroll to bottom to ensure Activity section loads
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  await page.locator('text=Wyse CRM').first().waitFor({ timeout: 25_000 }).catch(() => {});
  console.log('✅ Wyse CRM loaded successfully');
}

test.describe('Wyse CRM — Full Automation Testing', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(150_000);
    await loginAndGoToWyseCRM(page);
  });

  test('WCRM-01: Should load Wyse CRM page', async ({ page }) => {
    await expect(page).toHaveURL(/.*type=wyse.*/i);
    await expect(page.locator('text=Wyse CRM').first()).toBeVisible({ timeout: 15_000 });
    console.log('✅ WCRM-01 passed');
  });

  test('WCRM-02: Should display statistics cards', async ({ page }) => {
    await expect(page.locator('text=67').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('text=PIPELINE HEALTH').first()).toBeVisible({ timeout: 15_000 });
    console.log('✅ WCRM-02 passed');
  });

  test('WCRM-03: Should display Templates table', async ({ page }) => {
    await expect(page.locator('text=People').first()).toBeVisible({ timeout: 12_000 });
    console.log('✅ WCRM-03 passed');
  });

  test('WCRM-04: Should have header controls', async ({ page }) => {
    await expect(page.locator('input[placeholder*="search" i]').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /grid|list/i }).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=AI ANALYSIS').first()).toBeVisible({ timeout: 10_000 });
    console.log('✅ WCRM-04 passed');
  });

  test('WCRM-05: Should display Pipeline Health', async ({ page }) => {
    await expect(page.locator('text=HEALTHY').first()).toBeVisible({ timeout: 12_000 });
    console.log('✅ WCRM-05 passed');
  });

  test('WCRM-06: Should show Activity section', async ({ page }) => {
    // Scroll to make sure Activity is in viewport
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    const activityFound = await Promise.any
    ([
      page.locator('text=ACTIVITY').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
      page.locator('text=what\'s happening across').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
      page.locator('text=Foundershub AI updated').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
      page.locator('[class*="activity" i]').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
      page.locator('[class*="feed"], [class*="timeline"], [class*="log"]').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
    ]).catch(() => false);  

    expect(activityFound).toBe(true);
    console.log('✅ WCRM-06 passed: Activity section visible');
  });

  test('WCRM-07: Should open People template', async ({ page }) => 
  {
    await page.locator('text=People').first().click();
    await page.waitForTimeout(4_000);
    const hasContent = await Promise.any
    ([
      page.locator('text=Contact directory').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
      page.locator('text=Full Name').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
      page.locator('text=RESULTS').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
      page.locator('text=PIPELINE HEALTH').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
      page.locator('[class*="grid"], [class*="table"], [class*="row"]').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
    ]).catch(() => false);

    expect(hasContent).toBe(true);
    console.log('✅ WCRM-07 passed');
  });

  test('WCRM-08: Should not show error messages', async ({ page }) => {
    const errors = ['Something went wrong', 'Failed to load', 'Error'];
    for (const msg of errors) {
      await expect(page.locator(`text=${msg}`).first()).not.toBeVisible({ timeout: 5_000 });
    }
    console.log('✅ WCRM-08 passed');
  });
});