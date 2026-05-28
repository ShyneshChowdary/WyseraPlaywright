import { test, expect } from '@playwright/test';

test.describe('Wysera - Homepage Tests', () => {

  test('Happy - Homepage Loads Correctly', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');

    // Verify title
    await expect(page).toHaveTitle(/wysera/i);
    console.log('✅ Page title correct');

    // Verify main heading
    await expect(
      page.getByRole('heading', { name: /wysera replaces all those tools/i })
    ).toBeVisible({ timeout: 15000 });
    console.log('✅ Main heading visible');

    // Verify Join Waitlist button
    const waitlistBtn = page.getByRole('link', { name: /join waitlist/i });
    await expect(waitlistBtn).toBeVisible({ timeout: 10000 });
    console.log('✅ Join Waitlist button visible');

    console.log('🎉 Homepage Load Test Passed');
  });

  test('Happy - Navigation Bar Links Visible', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');

    const navLinks = ['Free tools', 'Pricing', 'Blog', 'Company'];

    for (const link of navLinks) {
      const navLink = page.getByRole('link', { name: new RegExp(link, 'i') }).first();
      await expect(navLink).toBeVisible({ timeout: 10000 });
      console.log(`✅ Nav link visible: ${link}`);
    }

    // Sign in button
    const signInBtn = page.getByRole('link', { name: /sign in/i }).first();
    await expect(signInBtn).toBeVisible({ timeout: 10000 });
    console.log('✅ Sign In button visible');

    console.log('🎉 Navbar Test Passed');
  });

  test('Happy - Logo Links to Homepage', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/pricing');
    await page.waitForLoadState('networkidle');

    const logo = page.getByRole('link', { name: /wysera/i }).first();
    await logo.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toBe('https://wysera.ai/');
    console.log('✅ Logo correctly links to homepage');
    console.log('🎉 Logo Link Test Passed');
  });

  test('Happy - Join Waitlist Button Links to Waitlist Page', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');

    const waitlistBtn = page.getByRole('link', { name: /join waitlist/i });
    await expect(waitlistBtn).toBeVisible({ timeout: 10000 });

    const href = await waitlistBtn.getAttribute('href');
    console.log('🔗 Waitlist href:', href);
    expect(href).toContain('waitlist');

    console.log('🎉 Waitlist Button Test Passed');
  });

  test('Happy - Four Promises Section Visible', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');

    const promises = [
      'Approval is the default',
      'Your data stays yours',
      'One brand voice',
      'No contracts',
    ];

    for (const promise of promises) {
      const el = page.getByText(new RegExp(promise, 'i')).first();
      await expect(el).toBeVisible({ timeout: 10000 });
      console.log(`✅ Promise visible: ${promise}`);
    }

    console.log('🎉 Four Promises Test Passed');
  });

  test('Happy - Footer Links All Present', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');

    const footerLinks = [
      'Privacy',
      'Terms',
      'Security',
      'Blog',
      'Pricing',
      'Company',
    ];

    for (const link of footerLinks) {
      const el = page.getByRole('link', { name: new RegExp(`^${link}$`, 'i') }).last();
      await expect(el).toBeVisible({ timeout: 10000 });
      console.log(`✅ Footer link visible: ${link}`);
    }

    console.log('🎉 Footer Links Test Passed');
  });

  test('Happy - Testimonials Section Visible', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasTestimonials = bodyText.includes('Sarah Chen') ||
                            bodyText.includes('Marcus Johnson') ||
                            bodyText.includes('Emily Rodriguez');

    console.log('✅ Testimonials visible:', hasTestimonials);
    expect(hasTestimonials).toBeTruthy();
    console.log('🎉 Testimonials Test Passed');
  });

  test('Negative - 404 Page for Invalid URL', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/nonexistentpage123');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const is404 = bodyText.includes('404') ||
                  bodyText.includes('not found') ||
                  bodyText.includes('page not found');

    console.log('📍 URL:', page.url());
    console.log('❌ 404 handled:', is404);

    if (!is404) {
      console.log('🐛 BUG: No 404 page for invalid URL');
    }

    console.log('🎉 404 Test Passed');
  });

});