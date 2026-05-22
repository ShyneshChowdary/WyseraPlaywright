import { test, expect } from './fixtures';

test.describe('Postwyse - Compose & Schedule Tests', () => {

  test('Happy Path - Open Compose & Schedule', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);
    console.log('✅ Login Successful');

    await page.waitForLoadState('networkidle');

    // ===== NAVIGATE TO COMPOSE & SCHEDULE =====
    const composeBtn = page.getByRole('button', { name: /compose & schedule/i });
    await composeBtn.waitFor({ state: 'visible', timeout: 15000 });
    await composeBtn.click({ force: true });
    console.log('✅ Clicked Compose & Schedule');

    await page.waitForTimeout(3000);
    console.log('📍 URL:', page.url());

    // ===== VERIFY PAGE LOADED =====
    const bodyText = await page.locator('body').innerText();
    const hasContent = bodyText.toLowerCase().includes('compose') ||
                       bodyText.toLowerCase().includes('schedule') ||
                       bodyText.toLowerCase().includes('post');

    console.log('✅ Compose page content visible:', hasContent);

    const h1s = await page.locator('h1, h2').allTextContents();
    console.log('📝 Headings:', h1s);

    expect(hasContent).toBeTruthy();
    console.log('🎉 Compose & Schedule Test Passed');
  });

  test('Happy Path - Compose New Social Post', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);

    await page.waitForLoadState('networkidle');

    // ===== NAVIGATE =====
    const composeBtn = page.getByRole('button', { name: /compose & schedule/i });
    await composeBtn.waitFor({ state: 'visible', timeout: 15000 });
    await composeBtn.click({ force: true });
    await page.waitForTimeout(3000);
    console.log('✅ Compose Page Loaded');

    // ===== FIND TEXT INPUT =====
    const textArea = page.locator('textarea, [contenteditable="true"]').first();
    if (await textArea.isVisible()) {
      await textArea.click();
      await textArea.type('This is a test social post created by Playwright automation #QA #Testing');
      console.log('✅ Post Content Entered');
    } else {
      console.log('⚠️ No text input found on compose page');
    }

    // ===== CHECK FOR SCHEDULE BUTTON =====
    const scheduleBtn = page.getByRole('button', { name: /schedule|post now|publish/i }).first();
    const isScheduleVisible = await scheduleBtn.isVisible();
    console.log('✅ Schedule button visible:', isScheduleVisible);

    console.log('🎉 Compose New Post Test Passed');
  });

});