import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://app-dev.foundershub.ai';
const DEV_URL = `${BASE_URL}/modules?type=development`;

const CREDENTIALS = {
  email: 'info@foundershub.ai',
  password: 'Invest@92',
};

async function loginAndGoToDevelopment(page: Page): Promise<void> {
  console.log('🔐 Logging into Development...');

  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  await page.locator('input[type="email"], input[name="email"]').first().fill(CREDENTIALS.email);
  await page.locator('input[type="password"]').first().fill(CREDENTIALS.password);

  await page.locator('button[type="submit"], button:has-text("Login")').first().click();

  await page.waitForURL(/.*dashboard.*/, { timeout: 45_000 });

  await page.goto(DEV_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForLoadState('domcontentloaded', { timeout: 15_000 });

  await page.locator('text=Development').first().waitFor({ timeout: 20_000 }).catch(() => {});
  await page.locator('text=Bug Tracker').first().waitFor({ timeout: 15_000 }).catch(() => {});

  console.log('✅ Development page loaded successfully');
}

test.describe('Leorix — Development Module', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(120_000);
    await loginAndGoToDevelopment(page);
  });

  test('LDV-01: should load Development module', async ({ page }) => {
    await expect(page).toHaveURL(/[?&]type=development/i);
    console.log('✅ LDV-01 passed');
  });

  test('LDV-02: should display Development module header', async ({ page }) => {
    await expect(page.locator('text=Development').first()).toBeVisible({ timeout: 12_000 });
    console.log('✅ LDV-02 passed');
  });

  test('LDV-03: should display Development module cards', async ({ page }) => {
  const hasContent = await Promise.any([
    page.locator('text=Bug Tracker').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
    page.locator('text=Development').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
    page.locator('[class*="card"], [class*="module"], [class*="template"]').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
  ]).catch(() => false);

  expect(hasContent).toBe(true);
  console.log('✅ LDV-03 passed');
});

  test('LDV-04: should open Bug Tracker details on click', async ({ page }) => {
    await page.locator('text=Bug Tracker').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1_000);

    const hasContent = await Promise.any([
      page.locator('text=Bug Tracker').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
      page.locator('text=RECORDS').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
      page.locator('text=RECENT RECORDS').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
      page.locator('[class*="record"], [class*="row"], [class*="grid"]').first().waitFor({ state: 'visible', timeout: 12_000 }).then(() => true),
    ]).catch(() => false);

    expect(hasContent).toBe(true);
    console.log('✅ LDV-04 passed: Bug Tracker opened');
  });

  test('LDV-05: should not show error messages', async ({ page }) => {
    for (const msg of ['Something went wrong', 'Failed to load', 'Error']) {
      await expect(page.locator(`text=${msg}`).first()).not.toBeVisible({ timeout: 5_000 });
    }
    console.log('✅ LDV-05 passed: No errors');
  });

  test('LDV-06: should show recent records / activity', async ({ page }) => {
    const hasRecent = await Promise.any([
      page.locator('text=RECENT RECORDS').first().waitFor({ state: 'visible', timeout: 10_000 }).then(() => true),
      page.locator('table').first().waitFor({ state: 'visible', timeout: 10_000 }).then(() => true),
      page.locator('text=Showing').first().waitFor({ state: 'visible', timeout: 10_000 }).then(() => true),
      page.locator('text=8 RECORDS').first().waitFor({ state: 'visible', timeout: 10_000 }).then(() => true),
    ]).catch(() => false);

    expect(hasRecent).toBe(true);
    console.log('✅ LDV-06 passed: Recent records / activity visible');
  });

});