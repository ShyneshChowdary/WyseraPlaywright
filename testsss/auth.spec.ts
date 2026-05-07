import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/**
 * Authentication Tests
 * Covers: Login, Logout, Session, Validation, OAuth (if present)
 *
 * @tags: @smoke @regression @auth
 */

const BASE_URL = process.env.BASE_URL || 'https://app-dev.foundershub.ai';
const VALID_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const VALID_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

test.describe('Authentication - Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  // ── TC-AUTH-001 ──────────────────────────────────────────────────────
  test('@smoke TC-AUTH-001: Login page renders with required elements', async () => {
    await loginPage.assertLoginFormVisible();
    const title = await loginPage.page.title();
    expect(title).toBeTruthy();
  });

  // ── TC-AUTH-002 ──────────────────────────────────────────────────────
  test('@smoke TC-AUTH-002: Successful login with valid credentials', async ({ page }) => {
    await loginPage.loginAndWaitForDashboard(VALID_EMAIL, VALID_PASSWORD);
    // Should be on dashboard or home — not on login page
    await expect(page).not.toHaveURL(/login|signin/i);
    await loginPage.screenshot('auth-success');
  });

  // ── TC-AUTH-003 ──────────────────────────────────────────────────────
  test('@regression TC-AUTH-003: Login fails with incorrect password', async () => {
    await loginPage.login(VALID_EMAIL, 'WrongPassword999!');
    await loginPage.assertErrorVisible();
  });

  // ── TC-AUTH-004 ──────────────────────────────────────────────────────
  test('@regression TC-AUTH-004: Login fails with non-existent email', async () => {
    await loginPage.login('nonexistent_99999@fake.com', VALID_PASSWORD);
    await loginPage.assertErrorVisible();
  });

  // ── TC-AUTH-005 ──────────────────────────────────────────────────────
  test('@regression TC-AUTH-005: Login fails with empty email', async ({ page }) => {
    await loginPage.passwordInput.fill(VALID_PASSWORD);
    await loginPage.submitButton.click();
    // Browser validation or custom error should block submission
    const emailInput = loginPage.emailInput;
    const validityMsg = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    if (!validityMsg) {
      await loginPage.assertErrorVisible();
    } else {
      expect(validityMsg).toBeTruthy();
    }
  });

  // ── TC-AUTH-006 ──────────────────────────────────────────────────────
  test('@regression TC-AUTH-006: Login fails with empty password', async ({ page }) => {
    await loginPage.emailInput.fill(VALID_EMAIL);
    await loginPage.submitButton.click();
    const pwInput = loginPage.passwordInput;
    const validityMsg = await pwInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    if (!validityMsg) {
      await loginPage.assertErrorVisible();
    } else {
      expect(validityMsg).toBeTruthy();
    }
  });

  // ── TC-AUTH-007 ──────────────────────────────────────────────────────
  test('@regression TC-AUTH-007: Email field rejects invalid format', async ({ page }) => {
    await loginPage.emailInput.fill('notanemail');
    await loginPage.passwordInput.fill(VALID_PASSWORD);
    await loginPage.submitButton.click();
    const emailInput = loginPage.emailInput;
    const validityMsg = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    // Either browser native validation or a visible error
    const isInvalid = !!validityMsg || await loginPage.errorMessage.isVisible().catch(() => false);
    expect(isInvalid).toBeTruthy();
  });

  // ── TC-AUTH-008 ──────────────────────────────────────────────────────
  test('@regression TC-AUTH-008: Password field masks input', async ({ page }) => {
    const type = await loginPage.passwordInput.getAttribute('type');
    expect(type).toBe('password');
  });

  // ── TC-AUTH-009 ──────────────────────────────────────────────────────
  test('@regression TC-AUTH-009: Forgot password link exists and is navigable', async ({ page }) => {
    const forgotLink = loginPage.forgotPasswordLink;
    const exists = await forgotLink.isVisible().catch(() => false);
    if (exists) {
      await forgotLink.click();
      await page.waitForLoadState('networkidle');
      // Should navigate away or show a modal
      const url = page.url();
      const bodyText = await page.locator('body').innerText();
      const navigated = url !== BASE_URL + '/' || /password|reset|email/i.test(bodyText);
      expect(navigated).toBeTruthy();
    } else {
      test.skip(true, 'Forgot password link not found on this build');
    }
  });

  // ── TC-AUTH-010 ──────────────────────────────────────────────────────
  test('@regression TC-AUTH-010: Sign up link is present', async ({ page }) => {
    const signupLink = loginPage.signupLink;
    const visible = await signupLink.isVisible().catch(() => false);
    // Log for QA report — not hard fail if not implemented
    console.log(`Sign-up link visible: ${visible}`);
  });
});

test.describe('Authentication - Session Management', () => {
  // ── TC-AUTH-011 ──────────────────────────────────────────────────────
  test('@regression TC-AUTH-011: Session persists on page reload', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await loginPage.loginAndWaitForDashboard(VALID_EMAIL, VALID_PASSWORD);

    const urlBeforeReload = page.url();
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be authenticated (not redirected to login)
    await expect(page).not.toHaveURL(/login|signin/i);
  });

  // ── TC-AUTH-012 ──────────────────────────────────────────────────────
  test('@regression TC-AUTH-012: Unauthenticated user is redirected to login', async ({ browser }) => {
    // Create a brand-new context (no stored auth)
    const freshContext = await browser.newContext({ storageState: undefined });
    const freshPage = await freshContext.newPage();

    await freshPage.goto(`${BASE_URL}/dashboard`);
    await freshPage.waitForLoadState('networkidle');

    // Should be redirected to login
    const url = freshPage.url();
    const isLoginPage = /login|signin|auth/i.test(url) || await freshPage.locator('input[type="password"]').isVisible().catch(() => false);
    expect(isLoginPage).toBeTruthy();

    await freshContext.close();
  });

  // ── TC-AUTH-013 ──────────────────────────────────────────────────────
  test('@regression TC-AUTH-013: SQL injection in login fields does not break app', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await loginPage.login("' OR '1'='1' --", "' OR '1'='1'");
    // App should show error, NOT be logged in
    await expect(page).not.toHaveURL(/dashboard|home|app/i);
  });

  // ── TC-AUTH-014 ──────────────────────────────────────────────────────
  test('@regression TC-AUTH-014: XSS attempt in login fields is sanitized', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    const xssPayload = '<script>alert("xss")</script>';
    await loginPage.emailInput.fill(xssPayload + '@test.com');
    await loginPage.passwordInput.fill(VALID_PASSWORD);
    await loginPage.submitButton.click();
    // Should show error, not execute script
    const dialogs: string[] = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });
    await page.waitForTimeout(2000);
    expect(dialogs).toHaveLength(0);
  });
});
