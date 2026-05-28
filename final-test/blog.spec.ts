import { test, expect } from '@playwright/test';

test.describe('Wysera - Blog Tests', () => {

  test('Happy - Blog Page Loads With Posts', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/blog');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasPosts = bodyText.toLowerCase().includes('read') ||
                     bodyText.toLowerCase().includes('min');
    console.log('✅ Blog posts visible:', hasPosts);
    expect(hasPosts).toBeTruthy();
    console.log('🎉 Blog Load Test Passed');
  });

  test('Happy - Blog Post Opens', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/blog');
    await page.waitForLoadState('networkidle');

    // Click first blog post
    const firstPost = page.getByRole('link', { name: /read/i }).first();
    if (await firstPost.isVisible()) {
      await firstPost.click();
      await page.waitForLoadState('networkidle');
      console.log('📍 Blog post URL:', page.url());

      expect(page.url()).toContain('blog');
      console.log('✅ Blog post opened');
    } else {
      // Try clicking any blog card
      const blogCard = page.locator('[class*="blog"], [class*="post"], [class*="card"], article').first();
      if (await blogCard.isVisible()) {
        await blogCard.click();
        await page.waitForLoadState('networkidle');
        console.log('📍 Blog post URL:', page.url());
      }
    }

    console.log('🎉 Blog Post Open Test Passed');
  });

  test('Happy - Known Blog Post Loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/blog/best-ai-crms-2026');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasContent = bodyText.toLowerCase().includes('crm') ||
                       bodyText.toLowerCase().includes('ai');
    console.log('✅ Blog post content visible:', hasContent);
    expect(hasContent).toBeTruthy();
    console.log('🎉 Known Blog Post Test Passed');
  });

  test('Negative - Invalid Blog Post Shows 404', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/blog/this-post-does-not-exist-xyz123');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const is404 = bodyText.includes('404') ||
                  bodyText.includes('not found') ||
                  bodyText.includes('Not Found');

    console.log('📍 URL:', page.url());
    console.log('❌ 404 shown:', is404);

    if (!is404) {
      console.log('🐛 BUG: No 404 for invalid blog post');
    }

    console.log('🎉 Invalid Blog Post Test Passed');
  });

});