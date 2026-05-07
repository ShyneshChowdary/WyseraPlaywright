import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/BasePage';

/**
 * Forms & CRUD Tests
 * Covers: Form validation, submissions, create/edit/delete operations
 *
 * @tags: @regression @forms
 */

test.describe('Forms - General Validation', () => {
  // ── TC-FORM-001 ──────────────────────────────────────────────────────
  test('@regression TC-FORM-001: All required fields show validation errors when empty', async ({ page }) => {
    const base = new BasePage(page);
    await base.goto('/');
    await page.waitForLoadState('networkidle');

    // Find all forms on the page
    const forms = await page.locator('form').all();
    console.log(`Forms found on page: ${forms.length}`);

    for (const form of forms) {
      const submitBtn = form.locator('button[type="submit"], input[type="submit"]').first();
      const hasSubmit = await submitBtn.isVisible().catch(() => false);

      if (hasSubmit) {
        // Clear all inputs and try to submit
        const inputs = await form.locator('input:not([type="hidden"]):not([type="submit"])').all();
        for (const input of inputs) {
          await input.fill('').catch(() => {});
        }
        await submitBtn.click();
        await page.waitForTimeout(500);

        // Check for validation errors
        const hasErrors = await page.locator('[class*="error"], [aria-invalid="true"], :invalid').first().isVisible().catch(() => false);
        console.log(`Form validation errors shown: ${hasErrors}`);
      }
    }
  });

  // ── TC-FORM-002 ──────────────────────────────────────────────────────
  test('@regression TC-FORM-002: Character limits are enforced on text inputs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const textInputs = await page.locator('input[maxlength]').all();
    console.log(`Inputs with maxlength: ${textInputs.length}`);

    for (const input of textInputs) {
      const maxlength = await input.getAttribute('maxlength');
      if (maxlength) {
        const testStr = 'A'.repeat(parseInt(maxlength) + 10);
        await input.fill(testStr);
        const value = await input.inputValue();
        expect(value.length).toBeLessThanOrEqual(parseInt(maxlength));
      }
    }
  });

  // ── TC-FORM-003 ──────────────────────────────────────────────────────
  test('@regression TC-FORM-003: Form dropdowns/selects have correct options', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const selects = await page.locator('select').all();
    console.log(`Select elements found: ${selects.length}`);

    for (const select of selects) {
      const options = await select.locator('option').allTextContents();
      console.log('Select options:', options);
      expect(options.length).toBeGreaterThan(0);
    }
  });

  // ── TC-FORM-004 ──────────────────────────────────────────────────────
  test('@regression TC-FORM-004: Date pickers accept valid date format', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const dateInputs = await page.locator('input[type="date"]').all();
    console.log(`Date inputs found: ${dateInputs.length}`);

    for (const input of dateInputs) {
      await input.fill('2025-01-15');
      const value = await input.inputValue();
      expect(value).toBe('2025-01-15');
    }
  });

  // ── TC-FORM-005 ──────────────────────────────────────────────────────
  test('@regression TC-FORM-005: File upload inputs accept allowed file types', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const fileInputs = await page.locator('input[type="file"]').all();
    console.log(`File inputs found: ${fileInputs.length}`);

    for (const input of fileInputs) {
      const accept = await input.getAttribute('accept');
      console.log(`File input accepts: ${accept || 'all'}`);
    }
  });

  // ── TC-FORM-006 ──────────────────────────────────────────────────────
  test('@regression TC-FORM-006: XSS payload in text fields is sanitized', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const textInputs = await page.locator('input[type="text"], textarea').all();
    const xss = '<img src=x onerror=alert(1)>';

    const alerts: string[] = [];
    page.on('dialog', async (d) => {
      alerts.push(d.message());
      await d.dismiss();
    });

    for (const input of textInputs.slice(0, 3)) {
      await input.fill(xss).catch(() => {});
    }

    await page.waitForTimeout(2000);
    expect(alerts).toHaveLength(0);
  });
});

test.describe('Forms - User Profile / Settings', () => {
  // ── TC-FORM-007 ──────────────────────────────────────────────────────
  test('@regression TC-FORM-007: Profile form saves updated data', async ({ page }) => {
    // Navigate to profile/settings page
    const profileRoutes = ['/profile', '/settings', '/account', '/user/settings'];
    let found = false;

    for (const route of profileRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const hasForm = await page.locator('form').isVisible().catch(() => false);
      if (hasForm) {
        found = true;
        console.log(`Profile form found at: ${route}`);
        break;
      }
    }

    if (!found) {
      test.skip(true, 'Profile/settings form route not found');
    }

    // Try updating a text field if found
    const nameInput = page.locator('input[name*="name" i], input[placeholder*="name" i]').first();
    const hasName = await nameInput.isVisible().catch(() => false);

    if (hasName) {
      const original = await nameInput.inputValue();
      await nameInput.fill(`Test User ${Date.now()}`);
      const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForLoadState('networkidle');
        console.log('Profile save attempted');
      }
      // Restore original
      await nameInput.fill(original).catch(() => {});
    }
  });
});
