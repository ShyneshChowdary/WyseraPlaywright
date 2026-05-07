import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 * Covers: UI screenshots comparison across builds
 * Run once to create baselines, then compare on future runs
 *
 * @tags: @visual @regression
 * Usage: First run creates snapshots. Subsequent runs compare.
 * To update snapshots: npx playwright test --update-snapshots
 */

test.describe('Visual Regression - Key Pages', () => {
  test.slow(); // These tests take longer

  // ── TC-VIS-001 ──────────────────────────────────────────────────────
  test('@visual TC-VIS-001: Login page visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Allow animations to settle

    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.05, // Allow 5% pixel difference
      fullPage: true,
    });
  });

  // ── TC-VIS-002 ──────────────────────────────────────────────────────
  test('@visual TC-VIS-002: Dashboard visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.05,
      fullPage: true,
    });
  });

  // ── TC-VIS-003 ──────────────────────────────────────────────────────
  test('@visual TC-VIS-003: Mobile viewport snapshot (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('mobile-view.png', {
      maxDiffPixelRatio: 0.05,
      fullPage: true,
    });
  });

  // ── TC-VIS-004 ──────────────────────────────────────────────────────
  test('@visual TC-VIS-004: Sidebar component visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('nav, aside, [class*="sidebar"]').first();
    const hasSidebar = await sidebar.isVisible().catch(() => false);

    if (hasSidebar) {
      await expect(sidebar).toHaveScreenshot('sidebar-component.png', {
        maxDiffPixelRatio: 0.05,
      });
    }
  });
});
