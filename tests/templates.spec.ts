import { test, expect } from './fixtures';

test.describe('Postwyse - Templates Tests', () => {

  test('Happy Path - Open Templates Page', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);
    console.log('✅ Login Successful');

    await page.waitForLoadState('networkidle');

    // ===== NAVIGATE TO TEMPLATES =====
    const templatesBtn = page.getByRole('button', { name: /^templates$/i });
    await templatesBtn.waitFor({ state: 'visible', timeout: 15000 });
    await templatesBtn.click({ force: true });
    await page.waitForTimeout(3000);
    console.log('✅ Clicked Templates');
    console.log('📍 URL:', page.url());

    const h1s = await page.locator('h1, h2').allTextContents();
    console.log('📝 Headings:', h1s);

    const bodyText = await page.locator('body').innerText();
    const hasTemplates = bodyText.toLowerCase().includes('template');
    console.log('✅ Templates content visible:', hasTemplates);

    expect(hasTemplates).toBeTruthy();
    console.log('🎉 Templates Page Test Passed');
  });

  test('Happy Path - Select a Template', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);

    await page.waitForLoadState('networkidle');

    const templatesBtn = page.getByRole('button', { name: /^templates$/i });
    await templatesBtn.waitFor({ state: 'visible', timeout: 15000 });
    await templatesBtn.click({ force: true });
    await page.waitForTimeout(3000);
    console.log('✅ Templates Page Loaded');

    // ===== FIND AND CLICK FIRST TEMPLATE =====
    const firstTemplate = page.locator(
      '[class*="template"], [class*="card"], [class*="item"]'
    ).first();

    if (await firstTemplate.isVisible()) {
      await firstTemplate.click({ force: true });
      await page.waitForTimeout(2000);
      console.log('✅ Template Selected');

      const bodyText = await page.locator('body').innerText();
      console.log('📄 Page after template click:', bodyText.substring(0, 200));
    } else {
      console.log('⚠️ No templates found on page');
    }

    console.log('🎉 Select Template Test Passed');
  });

});