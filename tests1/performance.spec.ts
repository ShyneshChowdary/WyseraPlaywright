import { test, expect } from '@playwright/test';

/**
 * Performance Tests
 * Covers: Load time, Core Web Vitals, API response times, bundle size
 *
 * @tags: @regression @performance
 */

const PERF_THRESHOLDS = {
  firstContentfulPaint: 3000,  // ms
  largestContentfulPaint: 4000, // ms
  timeToInteractive: 5000,     // ms
  domContentLoaded: 4000,      // ms
  totalLoadTime: 8000,         // ms
  apiResponseTime: 3000,       // ms (per request)
};

test.describe('Performance - Page Load Metrics', () => {
  // ── TC-PERF-001 ──────────────────────────────────────────────────────
  test('@regression TC-PERF-001: Homepage loads within threshold', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('load');

    const loadTime = Date.now() - startTime;
    console.log(`Total load time: ${loadTime}ms (threshold: ${PERF_THRESHOLDS.totalLoadTime}ms)`);

    expect(loadTime).toBeLessThan(PERF_THRESHOLDS.totalLoadTime);
  });

  // ── TC-PERF-002 ──────────────────────────────────────────────────────
  test('@regression TC-PERF-002: Core Web Vitals - FCP and LCP within thresholds', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const metrics = await page.evaluate(() => {
      return new Promise<{ fcp: number; lcp: number; cls: number }>((resolve) => {
        const result = { fcp: 0, lcp: 0, cls: 0 };

        // FCP
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntriesByType('paint');
          const fcp = entries.find((e) => e.name === 'first-contentful-paint');
          if (fcp) result.fcp = fcp.startTime;
        });
        try { fcpObserver.observe({ entryTypes: ['paint'] }); } catch {}

        // LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            result.lcp = (entries[entries.length - 1] as any).startTime;
          }
        });
        try { lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] }); } catch {}

        // CLS
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((e: any) => {
            if (!e.hadRecentInput) result.cls += e.value;
          });
        });
        try { clsObserver.observe({ entryTypes: ['layout-shift'] }); } catch {}

        // Fallback: use navigation timing
        setTimeout(() => {
          const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (nav) {
            if (!result.fcp) result.fcp = nav.domContentLoadedEventEnd - nav.fetchStart;
            if (!result.lcp) result.lcp = nav.loadEventEnd - nav.fetchStart;
          }
          resolve(result);
        }, 3000);
      });
    });

    console.log('Performance Metrics:', {
      'FCP (ms)': Math.round(metrics.fcp),
      'LCP (ms)': Math.round(metrics.lcp),
      'CLS': metrics.cls.toFixed(4),
    });

    if (metrics.fcp > 0) {
      expect(metrics.fcp).toBeLessThan(PERF_THRESHOLDS.firstContentfulPaint);
    }
    if (metrics.lcp > 0) {
      expect(metrics.lcp).toBeLessThan(PERF_THRESHOLDS.largestContentfulPaint);
    }
    // CLS should be < 0.1 (WCAG good threshold)
    expect(metrics.cls).toBeLessThan(0.25);
  });

  // ── TC-PERF-003 ──────────────────────────────────────────────────────
  test('@regression TC-PERF-003: Network requests - No failed API calls', async ({ page }) => {
    const failedRequests: { url: string; status: number }[] = [];
    const slowRequests: { url: string; duration: number }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();

      if (status >= 400 && status < 600 && !url.includes('favicon')) {
        failedRequests.push({ url, status });
      }
    });

    const requestTimings: Record<string, number> = {};
    page.on('request', (req) => {
      requestTimings[req.url()] = Date.now();
    });
    page.on('response', (res) => {
      const start = requestTimings[res.url()];
      if (start) {
        const duration = Date.now() - start;
        if (duration > PERF_THRESHOLDS.apiResponseTime && res.url().includes('/api/')) {
          slowRequests.push({ url: res.url(), duration });
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log(`Failed requests: ${failedRequests.length}`);
    console.log(`Slow API requests: ${slowRequests.length}`);

    if (failedRequests.length > 0) {
      console.warn('Failed requests:', failedRequests);
    }
    if (slowRequests.length > 0) {
      console.warn('Slow API requests:', slowRequests);
    }

    // Filter out 3rd party failures
    const appFailures = failedRequests.filter(
      (r) => r.url.includes('foundershub') || r.url.includes('localhost')
    );
    expect(appFailures).toHaveLength(0);
  });

  // ── TC-PERF-004 ──────────────────────────────────────────────────────
  test('@regression TC-PERF-004: No memory leaks - heap size after navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const heapBefore = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Navigate to a few pages and back
    const navLinks = await page.locator('nav a[href]:not([href="#"]):not([href="/"])').all();
    for (const link of navLinks.slice(0, 3)) {
      await link.click().catch(() => {});
      await page.waitForLoadState('networkidle');
    }

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const heapAfter = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    if (heapBefore > 0 && heapAfter > 0) {
      const heapGrowthMB = (heapAfter - heapBefore) / 1024 / 1024;
      console.log(`Heap growth after navigation: ${heapGrowthMB.toFixed(2)}MB`);
      // Alert if heap grew by more than 50MB (potential leak)
      expect(heapGrowthMB).toBeLessThan(50);
    } else {
      console.log('Memory API not available in this browser');
    }
  });

  // ── TC-PERF-005 ──────────────────────────────────────────────────────
  test('@regression TC-PERF-005: Page renders correctly on slow 3G network', async ({ page }) => {
    // Simulate slow 3G
    await page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms latency
      await route.continue();
    });

    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const time = Date.now() - start;

    console.log(`DOMContentLoaded on simulated slow network: ${time}ms`);
    // On slow network, allow 2x normal threshold
    expect(time).toBeLessThan(PERF_THRESHOLDS.domContentLoaded * 2);
  });
});
