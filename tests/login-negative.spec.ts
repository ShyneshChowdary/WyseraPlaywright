import { test, expect } from './fixtures';

test.describe('Postwyse - Login Negative Tests', () => {

  test('Negative - Wrong Password', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('https://postwyse.com/login');
    await page.waitForLoadState('networkidle');

    // ===== FILL WRONG PASSWORD =====
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.fill('test@wysera.ai');

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('WrongPassword123!');

    const loginBtn = page.getByRole('button', { name: /login|sign in|continue/i }).first();
    await loginBtn.click({ force: true });
    console.log('✅ Submitted wrong password');

    await page.waitForTimeout(3000);

    // ===== VERIFY ERROR MESSAGE =====
    const errorMsg = page.locator(
      '[class*="error"], [class*="alert"], [role="alert"], [class*="toast"], [class*="invalid"]'
    ).first();

    const isErrorVisible = await errorMsg.isVisible();
    const currentUrl = page.url();

    if (isErrorVisible) {
      // FIX: use textContent instead of innerText — works on all element types
      const errorText = await errorMsg.textContent();
      console.log('✅ Error message shown:', errorText?.trim());
    } else if (currentUrl.includes('dashboard')) {
      console.log('🐛 BUG: Logged in with wrong password!');
    } else {
      console.log('⚠️ No visible error but also not logged in');
    }

    // Should NOT be on dashboard
    expect(currentUrl).not.toContain('dashboard');
    console.log('🎉 Wrong Password Test Passed');
  });

  test('Negative - Empty Email and Password', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('https://postwyse.com/login');
    await page.waitForLoadState('networkidle');

    const loginBtn = page.getByRole('button', { name: /login|sign in|continue/i }).first();
    await loginBtn.waitFor({ state: 'visible', timeout: 15000 });
    await loginBtn.click({ force: true });
    console.log('✅ Clicked login with empty fields');

    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const errorVisible = await page.locator(
      '[class*="error"], [class*="invalid"], [class*="required"], [role="alert"]'
    ).first().isVisible();

    console.log('📍 URL:', currentUrl);
    console.log('❌ Error/Validation visible:', errorVisible);

    expect(currentUrl).not.toContain('dashboard');
    console.log('🎉 Empty Fields Test Passed');
  });

  test('Negative - Invalid Email Format', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('https://postwyse.com/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.fill('notavalidemail');

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('somepassword');

    const loginBtn = page.getByRole('button', { name: /login|sign in|continue/i }).first();
    await loginBtn.click({ force: true });
    console.log('✅ Submitted invalid email format');

    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log('📍 URL after invalid email:', currentUrl);

    expect(currentUrl).not.toContain('dashboard');
    console.log('🎉 Invalid Email Format Test Passed');
  });

  test('Negative - Wrong Email', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('https://postwyse.com/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.fill('nonexistent@fake.com');

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('Password123!');

    const loginBtn = page.getByRole('button', { name: /login|sign in|continue/i }).first();
    await loginBtn.click({ force: true });
    console.log('✅ Submitted non-existent email');

    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const errorVisible = await page.locator(
      '[class*="error"], [class*="alert"], [role="alert"]'
    ).first().isVisible();

    console.log('📍 URL:', currentUrl);
    console.log('❌ Error visible:', errorVisible);

    expect(currentUrl).not.toContain('dashboard');
    console.log('🎉 Wrong Email Test Passed');
  });

});