import { test as setup, expect } from '@playwright/test';
import * as path from 'path';

const AUTH_FILE = path.join(__dirname, '../fixtures/auth-state.json');

/**
 * Global Setup: Authenticate once and store session state.
 * All subsequent tests reuse this state — avoids repeating login.
 */
setup('authenticate and save session', async ({ page }) => {
  console.log('🔐 Running global auth setup...');

  await page.goto('/');

  // Wait for the SPA to fully hydrate
  await page.waitForLoadState('networkidle');

  // ── Try to find login form ───────────────────────────────────────────
  const emailSelector = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="email" i]',
    'input[placeholder*="Email"]',
  ].join(', ');

  const passwordSelector = [
    'input[type="password"]',
    'input[name="password"]',
    'input[placeholder*="password" i]',
  ].join(', ');

  // If redirected to login page, fill credentials
  const emailInput = page.locator(emailSelector).first();
  if (await emailInput.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await emailInput.fill(process.env.TEST_USER_EMAIL || 'test@example.com');

    const passwordInput = page.locator(passwordSelector).first();
    await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'TestPassword123!');

    // Submit login
    const submitBtn = page.locator([
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'button:has-text("Log In")',
      'button:has-text("Continue")',
    ].join(', ')).first();

    await submitBtn.click();

    // Wait for post-login navigation
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  // Save authentication state
  await page.context().storageState({ path: AUTH_FILE });
  console.log(`✅ Auth state saved to ${AUTH_FILE}`);
});
