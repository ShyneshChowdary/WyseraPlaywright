import { test, expect } from '@playwright/test';

test.describe('Wysera - Performance & Responsiveness Tests', () => {

  test('Happy - Homepage Loads Under 5 Seconds', async ({ page }) => {
    test.setTimeout(60000);

    const startTime = Date.now();
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`⏱️ Homepage load time: ${loadTime}ms`);

    if (loadTime > 5000) {
      console.log('🐛 BUG: Homepage took more than 5 seconds to load!');
    } else {
      console.log('✅ Homepage loaded within 5 seconds');
    }

    expect(loadTime).toBeLessThan(5000);
    console.log('🎉 Performance Test Passed');
  });

  test('Happy - All Key Pages Load Successfully', async ({ page }) => {
    test.setTimeout(120000);

    const pagesToCheck = [
      'https://wysera.ai/',
      'https://wysera.ai/pricing',
      'https://wysera.ai/blog',
      'https://wysera.ai/company',
      'https://wysera.ai/tools',
      'https://wysera.ai/privacy',
      'https://wysera.ai/terms',
      'https://wysera.ai/security',
    ];

    for (const url of pagesToCheck) {
      const response = await page.goto(url);
      const status = response?.status();
      console.log(`📍 ${url} → Status: ${status}`);
      expect(status).toBe(200);
      await page.waitForTimeout(1000);
    }

    console.log('🎉 All Pages Load Test Passed');
  });

  test('Happy - Mobile Viewport Works', async ({ page }) => {
    test.setTimeout(60000);

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');

    // Check main content visible on mobile
    const bodyText = await page.locator('body').innerText();
    const hasContent = bodyText.includes('Wysera');
    console.log('✅ Content visible on mobile:', hasContent);
    expect(hasContent).toBeTruthy();

    // Check no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    const hasHorizontalScroll = scrollWidth > clientWidth;
    console.log('📱 Horizontal scroll on mobile:', hasHorizontalScroll);

    if (hasHorizontalScroll) {
      console.log('🐛 BUG: Horizontal scroll on mobile — layout broken!');
    }

    console.log('🎉 Mobile Viewport Test Passed');
  });

  test('Happy - Tablet Viewport Works', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toContain('Wysera');
    console.log('✅ Content visible on tablet');
    console.log('🎉 Tablet Viewport Test Passed');
  });

  test('Negative - No Broken Images on Homepage', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');

    // Check all images are loaded
    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.src);
    });

    console.log('🖼️ Broken images found:', brokenImages.length);
    if (brokenImages.length > 0) {
      console.log('🐛 Broken image URLs:', brokenImages);
    }

    expect(brokenImages.length).toBe(0);
    console.log('🎉 No Broken Images Test Passed');
  });

  test('Negative - No Console Errors on Homepage', async ({ page }) => {
    test.setTimeout(60000);

    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('❌ Console errors found:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.log('  Error:', err));
    }

    expect(consoleErrors.length).toBe(0);
    console.log('🎉 No Console Errors Test Passed');
  });

});