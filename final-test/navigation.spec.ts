import { test, expect } from '@playwright/test';

test.describe('Wysera - Page Navigation Tests', () => {

  test('Happy - Pricing Page Loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/pricing');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/pricing/i);

    await expect(
      page.getByRole('heading', { name: /priced the way you buy/i })
    ).toBeVisible({ timeout: 15000 });

    console.log('✅ Pricing page loaded');
    console.log('🎉 Pricing Page Test Passed');
  });

  test('Happy - Blog Page Loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/blog');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasBlog = bodyText.toLowerCase().includes('blog') ||
                    bodyText.toLowerCase().includes('article') ||
                    bodyText.toLowerCase().includes('read');

    console.log('✅ Blog content visible:', hasBlog);
    expect(hasBlog).toBeTruthy();
    console.log('🎉 Blog Page Test Passed');
  });

  test('Happy - Company Page Loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/company');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasCompany = bodyText.toLowerCase().includes('company') ||
                       bodyText.toLowerCase().includes('team') ||
                       bodyText.toLowerCase().includes('about');

    console.log('✅ Company content visible:', hasCompany);
    expect(hasCompany).toBeTruthy();
    console.log('🎉 Company Page Test Passed');
  });

  test('Happy - Privacy Page Loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/privacy');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasPrivacy = bodyText.toLowerCase().includes('privacy');
    console.log('✅ Privacy content visible:', hasPrivacy);
    expect(hasPrivacy).toBeTruthy();
    console.log('🎉 Privacy Page Test Passed');
  });

  test('Happy - Terms Page Loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/terms');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasTerms = bodyText.toLowerCase().includes('terms');
    console.log('✅ Terms content visible:', hasTerms);
    expect(hasTerms).toBeTruthy();
    console.log('🎉 Terms Page Test Passed');
  });

  test('Happy - Security Page Loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/security');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasSecurity = bodyText.toLowerCase().includes('security');
    console.log('✅ Security content visible:', hasSecurity);
    expect(hasSecurity).toBeTruthy();
    console.log('🎉 Security Page Test Passed');
  });

  test('Happy - Free Tools Page Loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/tools');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasTools = bodyText.toLowerCase().includes('tool') ||
                     bodyText.toLowerCase().includes('headline') ||
                     bodyText.toLowerCase().includes('calculator');

    console.log('✅ Tools content visible:', hasTools);
    expect(hasTools).toBeTruthy();
    console.log('🎉 Free Tools Page Test Passed');
  });

  test('Happy - Waitlist Page Loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/waitlist');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasWaitlist = bodyText.toLowerCase().includes('waitlist') ||
                        bodyText.toLowerCase().includes('join') ||
                        bodyText.toLowerCase().includes('email');

    console.log('✅ Waitlist page content:', hasWaitlist);
    console.log('📍 URL:', page.url());
    expect(hasWaitlist).toBeTruthy();
    console.log('🎉 Waitlist Page Test Passed');
  });

  test('Happy - Nav Pricing Link Works', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');

    const pricingLink = page.getByRole('link', { name: /^pricing$/i }).first();
    await pricingLink.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('pricing');
    console.log('✅ Pricing nav link works');
    console.log('🎉 Nav Pricing Test Passed');
  });

  test('Happy - Nav Blog Link Works', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');

    const blogLink = page.getByRole('link', { name: /^blog$/i }).first();
    await blogLink.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('blog');
    console.log('✅ Blog nav link works');
    console.log('🎉 Nav Blog Test Passed');
  });

});