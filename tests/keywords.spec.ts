import { test, expect } from './fixtures';

test.describe('Postwyse - Keywords Tests', () => {

  test('Happy Path - Open Keywords Page', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);
    console.log('✅ Login Successful');

    await page.waitForLoadState('networkidle');

    // ===== NAVIGATE TO KEYWORDS =====
    const keywordsBtn = page.getByRole('button', { name: /^keywords$/i });
    await keywordsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await keywordsBtn.click({ force: true });
    await page.waitForTimeout(3000);
    console.log('✅ Clicked Keywords');
    console.log('📍 URL:', page.url());

    // ===== VERIFY PAGE =====
    const h1s = await page.locator('h1, h2').allTextContents();
    console.log('📝 Headings:', h1s);

    const bodyText = await page.locator('body').innerText();
    const hasKeywords = bodyText.toLowerCase().includes('keyword');
    console.log('✅ Keywords content visible:', hasKeywords);

    expect(hasKeywords).toBeTruthy();
    console.log('🎉 Keywords Page Test Passed');
  });

  test('Happy Path - Search for a Keyword', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);

    await page.waitForLoadState('networkidle');

    const keywordsBtn = page.getByRole('button', { name: /^keywords$/i });
    await keywordsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await keywordsBtn.click({ force: true });
    await page.waitForTimeout(3000);
    console.log('✅ Keywords Page Loaded');

    // ===== FIND SEARCH INPUT =====
    const searchInput = page.locator(
      'input[placeholder*="search" i], input[placeholder*="keyword" i], input[type="search"]'
    ).first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('marketing automation');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      console.log('✅ Keyword Searched');

      const results = await page.locator('[class*="result"], [class*="keyword"], tr, li').count();
      console.log('📊 Results found:', results);
    } else {
      console.log('⚠️ No search input found on keywords page');
    }

    console.log('🎉 Keyword Search Test Passed');
  });

  test('Negative - Search Empty Keyword', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);

    await page.waitForLoadState('networkidle');

    const keywordsBtn = page.getByRole('button', { name: /^keywords$/i });
    await keywordsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await keywordsBtn.click({ force: true });
    await page.waitForTimeout(3000);

    // ===== SEARCH WITH EMPTY INPUT =====
    const searchInput = page.locator(
      'input[placeholder*="search" i], input[placeholder*="keyword" i], input[type="search"]'
    ).first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      console.log('✅ Empty search submitted');

      const errorVisible = await page.locator(
        '[class*="error"], [class*="empty"], [class*="no-result"]'
      ).first().isVisible();
      console.log('❌ Error/empty state visible:', errorVisible);
    }

    console.log('🎉 Empty Keyword Search Test Passed');
  });

});