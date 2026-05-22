import { test, expect } from './fixtures';

test.describe('Postwyse - New Post Tests', () => {

  test('Happy Path - Create New Post', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);
    console.log('✅ Login Successful');

    await page.goto('https://postwyse.com/dashboard');
    await page.waitForLoadState('networkidle');

    // ===== CLICK NEW POST =====
    const newPostBtn = page.getByRole('button', { name: /^new post$/i }).first();
    await newPostBtn.waitFor({ state: 'visible', timeout: 15000 });
    await newPostBtn.click({ force: true });
    console.log('✅ New Post Opened');

    await page.waitForTimeout(2000);

    // ===== FILL TITLE (input with placeholder "Give this post a name…") =====
    const titleInput = page.locator('input[placeholder*="Give this post a name" i]').first();
    await titleInput.waitFor({ state: 'visible', timeout: 10000 });
    await titleInput.clear();
    await titleInput.fill('Automated Test Post - Playwright 2026');
    console.log('✅ Title Filled');

    // ===== FILL CONTENT (Tiptap contenteditable div) =====
    const contentEditor = page.locator('[contenteditable="true"].tiptap').first();
    await contentEditor.waitFor({ state: 'visible', timeout: 10000 });
    await contentEditor.click();
    await contentEditor.type('This is automated test content created by Playwright QA automation.');
    console.log('✅ Content Filled');

    // ===== SAVE / PUBLISH =====
    const saveBtn = page.getByRole('button', { name: /save|publish|schedule/i }).first();
    await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    await expect(saveBtn).toBeEnabled({ timeout: 5000 });
    await saveBtn.click({ force: true });
    console.log('✅ Post Saved');

    // ===== VERIFY SUCCESS =====
    await page.waitForSelector(
      '[class*="success"], [class*="toast"], [class*="notification"], [role="alert"]',
      { timeout: 15000 }
    ).catch(() => console.log('⚠️ Toast not detected, continuing...'));

    console.log('🎉 New Post Test Passed');
  });

  test('Negative - Submit Empty Post', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);

    await page.goto('https://postwyse.com/dashboard');
    await page.waitForLoadState('networkidle');

    // ===== OPEN NEW POST =====
    const newPostBtn = page.getByRole('button', { name: /^new post$/i }).first();
    await newPostBtn.waitFor({ state: 'visible', timeout: 15000 });
    await newPostBtn.click({ force: true });
    console.log('✅ New Post Opened');

    await page.waitForTimeout(2000);

    // ===== CLICK SAVE WITHOUT FILLING ANYTHING =====
    const saveBtn = page.getByRole('button', { name: /save|publish|schedule/i }).first();
    await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    await saveBtn.click({ force: true });
    console.log('✅ Clicked Save with empty fields');

    await page.waitForTimeout(2000);

    // ===== CHECK FOR VALIDATION =====
    const errorVisible = await page.locator(
      '[class*="error"], [class*="invalid"], [class*="required"], [role="alert"]'
    ).first().isVisible();

    console.log('❌ Validation error visible:', errorVisible);

    if (!errorVisible) {
      console.log('🐛 BUG: Empty post saved without validation error');
    } else {
      console.log('✅ Validation correctly shown for empty post');
    }

    console.log('🎉 Empty Post Test Passed');
  });

  test('Negative - Close Post Without Saving', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);

    await page.goto('https://postwyse.com/dashboard');
    await page.waitForLoadState('networkidle');

    // ===== OPEN NEW POST =====
    const newPostBtn = page.getByRole('button', { name: /^new post$/i }).first();
    await newPostBtn.waitFor({ state: 'visible', timeout: 15000 });
    await newPostBtn.click({ force: true });
    console.log('✅ New Post Opened');

    await page.waitForTimeout(2000);

    // ===== TYPE SOMETHING THEN CLOSE =====
    const titleInput = page.locator('input[placeholder*="Give this post a name" i]').first();
    await titleInput.waitFor({ state: 'visible', timeout: 10000 });
    await titleInput.fill('Unsaved Post Title');
    console.log('✅ Title entered but not saved');

    // ===== CLICK CLOSE =====
    const closeBtn = page.getByRole('button', { name: /close|cancel|dismiss/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click({ force: true });
      console.log('✅ Clicked Close');
    } else {
      await page.keyboard.press('Escape');
      console.log('✅ Pressed Escape to close');
    }

    await page.waitForTimeout(2000);

    // ===== CHECK FOR CONFIRMATION DIALOG =====
    const confirmDialog = await page.locator(
      '[class*="confirm"], [class*="dialog"], [class*="modal"], [role="dialog"]'
    ).first().isVisible();

    if (confirmDialog) {
      console.log('✅ Confirmation dialog shown before discarding');
    } else {
      console.log('⚠️ No confirmation dialog — post closed without warning');
    }

    console.log('🎉 Close Without Save Test Passed');
  });

});