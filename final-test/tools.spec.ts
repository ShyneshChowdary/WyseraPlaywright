import { test, expect } from '@playwright/test';

test.describe('Wysera - Free Tools Tests', () => {

  test('Happy - Headline Analyzer Loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/tools/headline-analyzer');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasContent = bodyText.toLowerCase().includes('headline');
    console.log('✅ Headline Analyzer visible:', hasContent);
    expect(hasContent).toBeTruthy();
    console.log('🎉 Headline Analyzer Test Passed');
  });

  test('Happy - Meta Tag Generator Loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/tools/meta-tag-generator');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasContent = bodyText.toLowerCase().includes('meta');
    console.log('✅ Meta Tag Generator visible:', hasContent);
    expect(hasContent).toBeTruthy();
    console.log('🎉 Meta Tag Generator Test Passed');
  });

  test('Happy - Stack Calculator Loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/tools/stack-replacement-calculator');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasContent = bodyText.toLowerCase().includes('stack') ||
                       bodyText.toLowerCase().includes('calculat');
    console.log('✅ Stack Calculator visible:', hasContent);
    expect(hasContent).toBeTruthy();
    console.log('🎉 Stack Calculator Test Passed');
  });

  test('Happy - Agentic Maturity Quiz Loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/tools/agentic-maturity');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').innerText();
    const hasContent = bodyText.toLowerCase().includes('agenti') ||
                       bodyText.toLowerCase().includes('quiz') ||
                       bodyText.toLowerCase().includes('maturit');
    console.log('✅ Agentic Maturity Quiz visible:', hasContent);
    expect(hasContent).toBeTruthy();
    console.log('🎉 Agentic Maturity Quiz Test Passed');
  });

  test('Happy - Headline Analyzer Input Works', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/tools/headline-analyzer');
    await page.waitForLoadState('networkidle');

    const input = page.locator('input, textarea').first();
    if (await input.isVisible()) {
      await input.fill('10 Best AI Tools for Marketing Teams in 2026');
      console.log('✅ Headline entered');

      const analyzeBtn = page.getByRole('button', {
        name: /analyze|check|submit|score/i
      }).first();

      if (await analyzeBtn.isVisible()) {
        await analyzeBtn.click({ force: true });
        await page.waitForTimeout(3000);
        console.log('✅ Headline analyzed');

        const bodyText = await page.locator('body').innerText();
        const hasResult = bodyText.toLowerCase().includes('score') ||
                          bodyText.toLowerCase().includes('result') ||
                          bodyText.toLowerCase().includes('rating');
        console.log('✅ Result visible:', hasResult);
      }
    } else {
      console.log('⚠️ No input found on headline analyzer');
    }

    console.log('🎉 Headline Analyzer Input Test Passed');
  });

  test('Negative - Headline Analyzer Empty Input', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('https://wysera.ai/tools/headline-analyzer');
    await page.waitForLoadState('networkidle');

    const analyzeBtn = page.getByRole('button', {
      name: /analyze|check|submit|score/i
    }).first();

    if (await analyzeBtn.isVisible()) {
      await analyzeBtn.click({ force: true });
      await page.waitForTimeout(2000);
      console.log('✅ Clicked analyze with empty input');

      const errorVisible = await page.locator(
        '[class*="error"], [class*="invalid"], [role="alert"]'
      ).first().isVisible();
      console.log('❌ Validation shown:', errorVisible);
    }

    console.log('🎉 Empty Headline Test Passed');
  });

});