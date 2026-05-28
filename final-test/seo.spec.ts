import { test, expect } from '@playwright/test';

test.describe('Wysera - SEO & Meta Tags Tests', () => {

  const pages = [
    { url: 'https://wysera.ai/', name: 'Homepage' },
    { url: 'https://wysera.ai/pricing', name: 'Pricing' },
    { url: 'https://wysera.ai/blog', name: 'Blog' },
    { url: 'https://wysera.ai/company', name: 'Company' },
  ];

  for (const p of pages) {
    test(`Happy - ${p.name} Has Meta Title`, async ({ page }) => {
      test.setTimeout(60000);
      await page.goto(p.url);
      await page.waitForLoadState('networkidle');

      const title = await page.title();
      console.log(`📝 ${p.name} title: ${title}`);
      expect(title.length).toBeGreaterThan(0);
      expect(title.toLowerCase()).toContain('wysera');
      console.log(`🎉 ${p.name} Meta Title Test Passed`);
    });

    test(`Happy - ${p.name} Has Meta Description`, async ({ page }) => {
      test.setTimeout(60000);
      await page.goto(p.url);
      await page.waitForLoadState('networkidle');

      const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
      console.log(`📝 ${p.name} meta description: ${metaDesc}`);
      expect(metaDesc).not.toBeNull();
      expect(metaDesc!.length).toBeGreaterThan(0);
      console.log(`🎉 ${p.name} Meta Description Test Passed`);
    });
  }

  test('Happy - Homepage Has OG Tags', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

    console.log('📝 OG Title:', ogTitle);
    console.log('📝 OG Description:', ogDesc);
    console.log('📝 OG Image:', ogImage);

    expect(ogTitle).not.toBeNull();
    expect(ogDesc).not.toBeNull();
    expect(ogImage).not.toBeNull();

    console.log('🎉 OG Tags Test Passed');
  });

  test('Happy - Homepage Has Canonical URL', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    console.log('🔗 Canonical URL:', canonical);
    expect(canonical).toContain('wysera.ai');
    console.log('🎉 Canonical URL Test Passed');
  });

});