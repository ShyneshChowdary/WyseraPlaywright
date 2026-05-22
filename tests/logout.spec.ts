import { test, expect } from './fixtures';

test.describe('Postwyse - Logout Tests', () => {

  test('Happy Path - Successful Logout', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);
    console.log('✅ Login Successful');

    await page.waitForLoadState('networkidle');

    // ===== FIND USER PROFILE / LOGOUT BUTTON =====
    // From diagnostic: user info is at bottom of sidebar
    const userProfile = page.locator('button').filter({ hasText: /test@wysera/i }).first();
    const altProfile = page.locator('[class*="avatar"], [class*="profile"], [class*="user"]').first();

    if (await userProfile.isVisible()) {
      await userProfile.click({ force: true });
    } else if (await altProfile.isVisible()) {
      await altProfile.click({ force: true });
    }
    console.log('✅ Clicked User Profile');

    await page.waitForTimeout(2000);

    // ===== CLICK LOGOUT =====
    const logoutBtn = page.getByRole('button', { name: /logout|sign out|log out/i });
    await logoutBtn.waitFor({ state: 'visible', timeout: 10000 });
    await logoutBtn.click({ force: true });
    console.log('✅ Clicked Logout');

    // ===== VERIFY REDIRECTED TO LOGIN PAGE =====
    await page.waitForURL(/login|signin|auth/, { timeout: 15000 });
    console.log('📍 Redirected to:', page.url());

    await expect(
      page.locator('input[type="email"], input[placeholder*="email" i]').first()
    ).toBeVisible({ timeout: 10000 });
    console.log('✅ Login page visible after logout');

    console.log('🎉 Logout Test Passed');
  });

  test('Negative - Access Dashboard After Logout', async ({ authenticatedPage: page }) => {
    test.setTimeout(60000);

    await page.waitForLoadState('networkidle');

    // ===== LOGOUT FIRST =====
    const userProfile = page.locator('button').filter({ hasText: /test@wysera/i }).first();
    if (await userProfile.isVisible()) {
      await userProfile.click({ force: true });
      await page.waitForTimeout(2000);
    }

    const logoutBtn = page.getByRole('button', { name: /logout|sign out|log out/i });
    await logoutBtn.waitFor({ state: 'visible', timeout: 10000 });
    await logoutBtn.click({ force: true });

    await page.waitForURL(/login|signin|auth/, { timeout: 15000 });
    console.log('✅ Logged Out Successfully');

    // ===== TRY TO ACCESS DASHBOARD DIRECTLY =====
    await page.goto('https://postwyse.com/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log('📍 URL after trying dashboard:', currentUrl);

    // Should redirect back to login — not stay on dashboard
    const isOnLogin = currentUrl.includes('login') ||
                      currentUrl.includes('signin') ||
                      currentUrl.includes('auth');

    const isOnDashboard = currentUrl.includes('dashboard');

    if (isOnLogin) {
      console.log('✅ Correctly redirected to login — session expired');
    } else if (isOnDashboard) {
      console.log('🐛 BUG: User can access dashboard after logout!');
    }

    expect(isOnDashboard).toBeFalsy();
    console.log('🎉 Post-Logout Access Test Passed');
  });

});