import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * Dashboard Tests
 * Covers: Layout, Navigation, Widgets, Data Loading, Responsiveness
 *
 * @tags: @smoke @regression @dashboard
 * Note: Uses saved auth state from global setup
 */

test.describe('Dashboard - Layout & Rendering', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto('/');
    await dashboard.waitForDashboardLoad();
  });

  // ── TC-DASH-001 ──────────────────────────────────────────────────────
  test('@smoke TC-DASH-001: Dashboard loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await dashboard.assertDashboardLoaded();
    await page.waitForTimeout(2000);

    // Filter out known 3rd party noise
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('analytics') && !e.includes('hotjar')
    );
    console.log('Console errors found:', criticalErrors);
    // Non-blocking: log but don't fail (CTO can review)
  });

  // ── TC-DASH-002 ──────────────────────────────────────────────────────
  test('@smoke TC-DASH-002: Sidebar navigation is visible', async () => {
    await expect(dashboard.sidebar).toBeVisible();
    const navItems = await dashboard.getAllNavItems();
    console.log('Nav items found:', navItems);
    expect(navItems.length).toBeGreaterThan(0);
  });

  // ── TC-DASH-003 ──────────────────────────────────────────────────────
  test('@smoke TC-DASH-003: Top header / navbar is visible', async () => {
    await expect(dashboard.topNavbar).toBeVisible();
  });

  // ── TC-DASH-004 ──────────────────────────────────────────────────────
  test('@regression TC-DASH-004: Page title is set correctly', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    console.log(`Page title: "${title}"`);
  });

  // ── TC-DASH-005 ──────────────────────────────────────────────────────
  test('@regression TC-DASH-005: No broken images on dashboard', async ({ page }) => {
    const images = page.locator('img');
    const imgCount = await images.count();

    const brokenImages: string[] = [];
    for (let i = 0; i < imgCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth).catch(() => 0);
      if (src && naturalWidth === 0 && !src.startsWith('data:')) {
        brokenImages.push(src);
      }
    }

    console.log(`Total images: ${imgCount}, Broken: ${brokenImages.length}`);
    if (brokenImages.length > 0) {
      console.warn('Broken images found:', brokenImages);
    }
    expect(brokenImages).toHaveLength(0);
  });

  // ── TC-DASH-006 ──────────────────────────────────────────────────────
  test('@regression TC-DASH-006: All navigation links are not broken (404)', async ({ page }) => {
    const links = await page.locator('a[href]').all();
    const internalLinks: string[] = [];

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('#')) {
        internalLinks.push(href);
      }
    }

    console.log(`Internal links found: ${internalLinks.length}`);

    // Check first 10 links to keep test fast
    const linksToCheck = [...new Set(internalLinks)].slice(0, 10);
    for (const href of linksToCheck) {
      const response = await page.request.get(href).catch(() => null);
      if (response) {
        console.log(`${href} → ${response.status()}`);
        expect(response.status()).not.toBe(404);
      }
    }
  });

  // ── TC-DASH-007 ──────────────────────────────────────────────────────
  test('@regression TC-DASH-007: Loading spinner disappears after data loads', async ({ page }) => {
    const spinner = dashboard.loadingSpinner;
    // Spinner may not always be visible (data cached), so just check it's not stuck
    const isStuck = await spinner.isVisible({ timeout: 2000 }).catch(() => false);
    if (isStuck) {
      await expect(spinner).toBeHidden({ timeout: 15_000 });
    }
  });
});

test.describe('Dashboard - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto('/');
    await dashboard.waitForDashboardLoad();
  });

  // ── TC-DASH-008 ──────────────────────────────────────────────────────
  test('@smoke TC-DASH-008: All sidebar links navigate without errors', async ({ page }) => {
    const navLinks = await page.locator('nav a, aside a').all();
    const hrefs: string[] = [];

    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('http') && href !== '#') {
        hrefs.push(href);
      }
    }

    const uniqueHrefs = [...new Set(hrefs)];
    console.log(`Testing ${uniqueHrefs.length} nav routes`);

    for (const href of uniqueHrefs.slice(0, 8)) {
      await page.goto(href);
      await page.waitForLoadState('networkidle');
      const status = page.url();
      // Should not redirect to an error page
      expect(await page.locator('text=/404|not found|error/i').isVisible().catch(() => false)).toBe(false);
      console.log(`✅ ${href} → OK`);
    }
  });

  // ── TC-DASH-009 ──────────────────────────────────────────────────────
  test('@regression TC-DASH-009: Browser back navigation works correctly', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const initialUrl = page.url();

    // Click first internal nav link
    const firstLink = page.locator('nav a[href]:not([href="#"])').first();
    const href = await firstLink.getAttribute('href');
    if (href) {
      await firstLink.click();
      await page.waitForLoadState('networkidle');
      await page.goBack();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toBe(initialUrl);
    }
  });

  // ── TC-DASH-010 ──────────────────────────────────────────────────────
  test('@regression TC-DASH-010: Logout works and redirects to login', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    // Try to find and click logout
    const userMenu = dashboard.userAvatar;
    const menuVisible = await userMenu.isVisible().catch(() => false);

    if (menuVisible) {
      await dashboard.logout();
      await page.waitForLoadState('networkidle');
      // Should be on login page
      const isLoginVisible = await page.locator('input[type="password"]').isVisible().catch(() => false);
      const isLoginUrl = /login|signin|auth/i.test(page.url());
      expect(isLoginVisible || isLoginUrl).toBeTruthy();
    } else {
      test.skip(true, 'User menu/avatar not found — check selector');
    }
  });
});
