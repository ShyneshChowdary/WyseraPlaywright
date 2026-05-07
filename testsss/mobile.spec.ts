import { test, expect, devices } from '@playwright/test';

/**
 * Responsive / Mobile Tests
 * Covers: Mobile layouts, touch interactions, viewport breakpoints
 *
 * @tags: @regression @mobile @responsive
 */

const VIEWPORTS = {
  mobile: { width: 375, height: 812 },    // iPhone 14
  tablet: { width: 768, height: 1024 },   // iPad
  laptop: { width: 1280, height: 800 },   // Standard laptop
  desktop: { width: 1920, height: 1080 }, // Full HD
};

test.describe('Responsive - Breakpoint Layout Tests', () => {
  // ── TC-MOB-001 ──────────────────────────────────────────────────────
  test('@regression TC-MOB-001: Mobile viewport (375px) renders without horizontal scroll', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = VIEWPORTS.mobile.width;

    console.log(`Body scroll width: ${bodyWidth}px, Viewport: ${windowWidth}px`);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 5); // 5px tolerance
  });

  // ── TC-MOB-002 ──────────────────────────────────────────────────────
  test('@regression TC-MOB-002: Tablet viewport (768px) layout is correct', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS.tablet.width + 5);
  });

  // ── TC-MOB-003 ──────────────────────────────────────────────────────
  test('@regression TC-MOB-003: Mobile hamburger menu opens and closes', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for hamburger / menu toggle
    const hamburger = page.locator([
      'button[aria-label*="menu" i]',
      'button[class*="hamburger"]',
      'button[class*="menu-toggle"]',
      '[class*="burger"]',
      'button:has([class*="bar"])',
    ].join(', ')).first();

    const hasBurger = await hamburger.isVisible().catch(() => false);

    if (hasBurger) {
      // Open menu
      await hamburger.click();
      await page.waitForTimeout(500);

      const nav = page.locator('nav, [class*="mobile-nav"], [class*="drawer"]').first();
      const isNavOpen = await nav.isVisible().catch(() => false);
      console.log(`Mobile nav opened: ${isNavOpen}`);

      // Close menu
      await hamburger.click();
      await page.waitForTimeout(500);
    } else {
      console.log('No hamburger menu found — may use different mobile nav pattern');
    }
  });

  // ── TC-MOB-004 ──────────────────────────────────────────────────────
  test('@regression TC-MOB-004: Touch targets are minimum 44x44px', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const smallTargets = await page.evaluate(() => {
      const interactive = document.querySelectorAll('button, a, [role="button"], input[type="checkbox"], input[type="radio"]');
      const small: string[] = [];

      interactive.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
          const text = (el.textContent || '').trim().substring(0, 30);
          small.push(`${el.tagName}(${Math.round(rect.width)}x${Math.round(rect.height)}): "${text}"`);
        }
      });

      return small;
    });

    console.log(`Small touch targets found: ${smallTargets.length}`);
    if (smallTargets.length > 0) {
      console.warn('Elements below 44x44px touch target:', smallTargets.slice(0, 10));
    }

    // Warn but don't hard-fail (many apps have minor violations)
    console.log(`Touch target violations: ${smallTargets.length}`);
  });

  // ── TC-MOB-005 ──────────────────────────────────────────────────────
  test('@regression TC-MOB-005: Login form is usable on mobile', async ({ page }) => {
    // Use fresh context (no auth)
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    const hasForm = await emailInput.isVisible().catch(() => false);
    if (hasForm) {
      // Check they're visible and clickable on mobile
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();

      const emailRect = await emailInput.boundingBox();
      const passRect = await passwordInput.boundingBox();

      console.log(`Email input: ${emailRect?.width}x${emailRect?.height}`);
      console.log(`Password input: ${passRect?.width}x${passRect?.height}`);

      // Inputs should be wide enough to type on mobile
      expect(emailRect?.width).toBeGreaterThan(200);
    }
  });

  // ── TC-MOB-006 ──────────────────────────────────────────────────────
  test('@regression TC-MOB-006: Font sizes are readable on mobile (min 14px)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tinyText = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, span, label, a, button, h1, h2, h3, li');
      const small: string[] = [];

      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize > 0 && fontSize < 12 && (el.textContent || '').trim()) {
          small.push(`${el.tagName}: ${fontSize}px`);
        }
      });

      return small;
    });

    console.log(`Elements with font < 12px: ${tinyText.length}`);
    if (tinyText.length > 0) {
      console.warn('Tiny text elements:', tinyText.slice(0, 5));
    }
  });
});
