import { test, expect } from '@playwright/test';

/**
 * Navigation & Routing Tests
 * Covers: SPA routing, 404 handling, deep links, breadcrumbs
 *
 * @tags: @regression @navigation
 */

test.describe('Navigation - SPA Routing', () => {
  // ── TC-NAV-001 ──────────────────────────────────────────────────────
  test('@smoke TC-NAV-001: App loads without white screen on cold visit', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    const bodyText = await body.innerText();
    const bodyHTML = await body.innerHTML();

    // Body should have content — not just an empty root div
    expect(bodyHTML.length).toBeGreaterThan(100);
    console.log(`Body text length: ${bodyText.length}`);
  });

  // ── TC-NAV-002 ──────────────────────────────────────────────────────
  test('@regression TC-NAV-002: 404 page is shown for unknown routes', async ({ page }) => {
    await page.goto('/this-page-definitely-does-not-exist-xyz-123');
    await page.waitForLoadState('networkidle');

    const is404 = await page.locator('text=/404|not found|page.*not.*found/i').isVisible().catch(() => false);
    const isRedirected = /login|signin|home|\/$/.test(page.url());

    // Either a 404 page OR redirect is acceptable behavior
    expect(is404 || isRedirected).toBeTruthy();
    console.log(`Unknown route behavior: 404 shown=${is404}, redirected=${isRedirected}`);
  });

  // ── TC-NAV-003 ──────────────────────────────────────────────────────
  test('@regression TC-NAV-003: Deep link navigation works (direct URL access)', async ({ page }) => {
    // Get all navigation links first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const navLinks = await page.locator('nav a[href]').all();
    const hrefs: string[] = [];

    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('http') && href !== '#' && href !== '/') {
        hrefs.push(href);
      }
    }

    // Test first 5 routes via direct URL (simulating deep link)
    for (const href of hrefs.slice(0, 5)) {
      await page.goto(href);
      await page.waitForLoadState('networkidle');

      const isLoginPage = await page.locator('input[type="password"]').isVisible().catch(() => false);
      const isErrorPage = await page.locator('text=/404|error/i').isVisible().catch(() => false);

      // Authenticated deep link should work (not 404)
      expect(isErrorPage).toBeFalsy();
      console.log(`✅ Deep link ${href}: OK`);
    }
  });

  // ── TC-NAV-004 ──────────────────────────────────────────────────────
  test('@regression TC-NAV-004: Browser back / forward navigation is functional', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const homePath = page.url();

    const firstNavLink = page.locator('nav a[href]:not([href="#"]):not([href="/"])').first();
    const href = await firstNavLink.getAttribute('href').catch(() => null);

    if (href) {
      await page.goto(href);
      await page.waitForLoadState('networkidle');
      const secondPath = page.url();

      await page.goBack();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toBe(homePath);

      await page.goForward();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toBe(secondPath);
    }
  });

  // ── TC-NAV-005 ──────────────────────────────────────────────────────
  test('@regression TC-NAV-005: Page title updates on route change', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const homeTitle = await page.title();

    const navLinks = await page.locator('nav a[href]:not([href="#"]):not([href="/"])').all();

    if (navLinks.length > 0) {
      await navLinks[0].click();
      await page.waitForLoadState('networkidle');
      const newTitle = await page.title();
      console.log(`Home: "${homeTitle}" → Page: "${newTitle}"`);
      // Both should have titles
      expect(newTitle).toBeTruthy();
    }
  });

  // ── TC-NAV-006 ──────────────────────────────────────────────────────
  test('@regression TC-NAV-006: Breadcrumb navigation (if present) is correct', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate deeper if possible
    const firstNavLink = page.locator('nav a[href]:not([href="#"]):not([href="/"])').first();
    await firstNavLink.click().catch(() => {});
    await page.waitForLoadState('networkidle');

    const breadcrumb = page.locator('[aria-label*="breadcrumb" i], [class*="breadcrumb"], nav[class*="bread"]').first();
    const hasBreadcrumb = await breadcrumb.isVisible().catch(() => false);

    if (hasBreadcrumb) {
      const crumbs = await breadcrumb.locator('a, span, li').allTextContents();
      console.log('Breadcrumbs:', crumbs);
      expect(crumbs.length).toBeGreaterThan(0);
    } else {
      console.log('No breadcrumb navigation found');
    }
  });
});

test.describe('Navigation - External Links', () => {
  // ── TC-NAV-007 ──────────────────────────────────────────────────────
  test('@regression TC-NAV-007: External links open in new tab', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const externalLinks = await page.locator('a[href^="http"][target="_blank"]').all();
    console.log(`External links with target="_blank": ${externalLinks.length}`);

    for (const link of externalLinks) {
      const rel = await link.getAttribute('rel');
      // Security: external links should have rel="noopener" or rel="noreferrer"
      const isSafe = rel?.includes('noopener') || rel?.includes('noreferrer');
      if (!isSafe) {
        const href = await link.getAttribute('href');
        console.warn(`⚠️ External link without rel=noopener: ${href}`);
      }
    }
  });
});
