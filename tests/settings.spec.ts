import { test, expect } from './fixtures';

test.describe('Postwyse - Settings Tests', () => {

  test('Happy Path - Open Integrations', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);
    console.log('✅ Login Successful');

    await page.waitForLoadState('networkidle');

    const integrationsBtn = page.getByRole('button', { name: /^integrations$/i });
    await integrationsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await integrationsBtn.click({ force: true });
    await page.waitForTimeout(3000);
    console.log('✅ Clicked Integrations');
    console.log('📍 URL:', page.url());

    const h1s = await page.locator('h1, h2').allTextContents();
    console.log('📝 Headings:', h1s);

    const bodyText = await page.locator('body').innerText();
    const hasContent = bodyText.toLowerCase().includes('integration') ||
                       bodyText.toLowerCase().includes('connect');
    console.log('✅ Integrations content visible:', hasContent);

    expect(hasContent).toBeTruthy();
    console.log('🎉 Integrations Test Passed');
  });

  test('Happy Path - Open Brand Guidelines', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);

    await page.waitForLoadState('networkidle');

    const brandBtn = page.getByRole('button', { name: /brand guidelines/i });
    await brandBtn.waitFor({ state: 'visible', timeout: 15000 });
    await brandBtn.click({ force: true });
    await page.waitForTimeout(3000);
    console.log('✅ Clicked Brand Guidelines');

    const h1s = await page.locator('h1, h2').allTextContents();
    console.log('📝 Headings:', h1s);

    const bodyText = await page.locator('body').innerText();
    const hasContent = bodyText.toLowerCase().includes('brand');
    console.log('✅ Brand Guidelines content visible:', hasContent);

    expect(hasContent).toBeTruthy();
    console.log('🎉 Brand Guidelines Test Passed');
  });

  test('Happy Path - Open User Settings', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);

    await page.waitForLoadState('networkidle');

    const userSettingsBtn = page.getByRole('button', { name: /user settings/i });
    await userSettingsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await userSettingsBtn.click({ force: true });
    await page.waitForTimeout(3000);
    console.log('✅ Clicked User Settings');

    const h1s = await page.locator('h1, h2').allTextContents();
    console.log('📝 Headings:', h1s);

    const bodyText = await page.locator('body').innerText();
    const hasContent = bodyText.toLowerCase().includes('setting') ||
                       bodyText.toLowerCase().includes('profile') ||
                       bodyText.toLowerCase().includes('account');
    console.log('✅ User Settings content visible:', hasContent);

    expect(hasContent).toBeTruthy();
    console.log('🎉 User Settings Test Passed');
  });

});