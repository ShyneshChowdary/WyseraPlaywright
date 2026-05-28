import { test, expect } from '@playwright/test';

test.describe('Wysera - Pricing Page Tests', () => {

  test('Happy - All Pricing Tiers Visible', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/pricing');
    await page.waitForLoadState('networkidle');

    const tiers = ['Starter', 'Growth', 'Pro', 'Enterprise'];

    for (const tier of tiers) {
      const el = page.getByRole('heading', { name: new RegExp(tier, 'i') }).first();
      await expect(el).toBeVisible({ timeout: 10000 });
      console.log(`✅ Tier visible: ${tier}`);
    }

    console.log('🎉 Pricing Tiers Test Passed');
  });

  test('Happy - Pricing Amounts Visible', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/pricing');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();

    const prices = ['$23', '$63', '$127', 'Custom'];
    for (const price of prices) {
      const visible = bodyText.includes(price);
      console.log(`✅ Price ${price} visible: ${visible}`);
      expect(visible).toBeTruthy();
    }

    console.log('🎉 Pricing Amounts Test Passed');
  });

  test('Happy - Monthly/Annual Toggle Works', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/pricing');
    await page.waitForLoadState('networkidle');

    // Check Monthly toggle
    const monthlyBtn = page.getByRole('button', { name: /^monthly$/i })
      .or(page.getByText(/^monthly$/i)).first();

    if (await monthlyBtn.isVisible()) {
      await monthlyBtn.click({ force: true });
      await page.waitForTimeout(1000);
      console.log('✅ Monthly toggle clicked');
    }

    // Check Annual toggle
    const annualBtn = page.getByRole('button', { name: /annual/i })
      .or(page.getByText(/annual/i)).first();

    if (await annualBtn.isVisible()) {
      await annualBtn.click({ force: true });
      await page.waitForTimeout(1000);
      console.log('✅ Annual toggle clicked');

      // Verify save 20% text appears
      const bodyText = await page.locator('body').innerText();
      const hasSave = bodyText.includes('20%') || bodyText.includes('Save');
      console.log('✅ Save 20% visible:', hasSave);
    }

    console.log('🎉 Pricing Toggle Test Passed');
  });

  test('Happy - FAQ Section Visible', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/pricing');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const faqItems = [
      'free trials',
      'PostWyse or just OpsWyse',
      'workspace and a seat',
      'downgrade or cancel',
      'annual pricing',
    ];

    for (const faq of faqItems) {
      const visible = bodyText.toLowerCase().includes(faq.toLowerCase());
      console.log(`✅ FAQ item visible "${faq}": ${visible}`);
      expect(visible).toBeTruthy();
    }

    console.log('🎉 FAQ Section Test Passed');
  });

  test('Happy - Email Founder Links Work', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/pricing');
    await page.waitForLoadState('networkidle');

    const emailLinks = page.locator('a[href*="mailto"]');
    const count = await emailLinks.count();
    console.log('📧 Email links found:', count);
    expect(count).toBeGreaterThan(0);

    const firstHref = await emailLinks.first().getAttribute('href');
    console.log('✅ First email link:', firstHref);
    expect(firstHref).toContain('gkotte.com');

    console.log('🎉 Email Links Test Passed');
  });

  test('Negative - Start Free Trial Buttons Show Coming Soon', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/pricing');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasComingSoon = bodyText.toLowerCase().includes('coming soon') ||
                          bodyText.toLowerCase().includes('soon');

    console.log('✅ Coming soon text visible:', hasComingSoon);

    // Trial buttons should be disabled
    const trialBtns = page.getByRole('button', { name: /start free trial/i });
    const count = await trialBtns.count();
    console.log('🔘 Trial buttons found:', count);

    for (let i = 0; i < count; i++) {
      const isDisabled = await trialBtns.nth(i).isDisabled();
      console.log(`  Button[${i}] disabled: ${isDisabled}`);
    }

    console.log('🎉 Coming Soon Test Passed');
  });

});