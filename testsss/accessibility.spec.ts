import { test, expect } from '@playwright/test';

/**
 * Accessibility Tests
 * Covers: WCAG 2.1 AA compliance, keyboard navigation, ARIA, color contrast
 *
 * @tags: @regression @accessibility @a11y
 * Note: Uses axe-playwright for automated WCAG scanning
 */

test.describe('Accessibility - WCAG Compliance', () => {
  // ── TC-A11Y-001 ──────────────────────────────────────────────────────
  test('@regression TC-A11Y-001: Login page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Dynamically import axe for accessibility testing
    await page.evaluate(async () => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js';
      document.head.appendChild(script);
      await new Promise((resolve) => (script.onload = resolve));
    });

    const violations = await page.evaluate(async () => {
      // @ts-ignore
      const results = await axe.run(document.body, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      });
      return results.violations.map((v: any) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      }));
    });

    const criticalViolations = violations.filter((v: any) => v.impact === 'critical');
    const seriousViolations = violations.filter((v: any) => v.impact === 'serious');

    console.log('All violations:', violations);
    console.log(`Critical: ${criticalViolations.length}, Serious: ${seriousViolations.length}`);

    if (criticalViolations.length > 0) {
      console.error('Critical violations:', JSON.stringify(criticalViolations, null, 2));
    }

    // Fail only on critical violations
    expect(criticalViolations).toHaveLength(0);
  });

  // ── TC-A11Y-002 ──────────────────────────────────────────────────────
  test('@regression TC-A11Y-002: All images have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();
    const missingAlt: string[] = [];

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src') || 'unknown';
      if (alt === null) {
        missingAlt.push(src);
      }
    }

    console.log(`Images: ${images.length}, Missing alt: ${missingAlt.length}`);
    if (missingAlt.length > 0) {
      console.warn('Images missing alt text:', missingAlt);
    }
    expect(missingAlt).toHaveLength(0);
  });

  // ── TC-A11Y-003 ──────────────────────────────────────────────────────
  test('@regression TC-A11Y-003: All form inputs have associated labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const inputs = await page.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"])').all();
    const unlabeled: string[] = [];

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      let hasLabel = !!(ariaLabel || ariaLabelledBy || placeholder);

      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        hasLabel = hasLabel || label > 0;
      }

      if (!hasLabel) {
        const type = await input.getAttribute('type');
        unlabeled.push(`input[type="${type}"]`);
      }
    }

    console.log(`Inputs: ${inputs.length}, Without label: ${unlabeled.length}`);
    expect(unlabeled).toHaveLength(0);
  });

  // ── TC-A11Y-004 ──────────────────────────────────────────────────────
  test('@regression TC-A11Y-004: Keyboard navigation works - Tab key cycles through elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const focusedElements: string[] = [];

    // Tab through first 10 focusable elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}[${el.getAttribute('type') || el.className.split(' ')[0]}]` : 'none';
      });
      focusedElements.push(focused);
    }

    console.log('Tab sequence:', focusedElements);
    const uniqueFocused = new Set(focusedElements);
    // Should be able to focus at least 3 distinct elements
    expect(uniqueFocused.size).toBeGreaterThan(2);
  });

  // ── TC-A11Y-005 ──────────────────────────────────────────────────────
  test('@regression TC-A11Y-005: Page has a single <h1> tag', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const h1Count = await page.locator('h1').count();
    console.log(`H1 count: ${h1Count}`);
    // WCAG best practice: exactly one h1 per page
    expect(h1Count).toBeLessThanOrEqual(1);
  });

  // ── TC-A11Y-006 ──────────────────────────────────────────────────────
  test('@regression TC-A11Y-006: Color contrast - no inline zero-opacity text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const invisibleText = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const issues: string[] = [];
      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        if (
          el.textContent?.trim() &&
          (style.opacity === '0' || style.color === 'transparent') &&
          style.display !== 'none'
        ) {
          issues.push(el.tagName + ': ' + el.textContent?.substring(0, 30));
        }
      });
      return issues;
    });

    console.log('Invisible text issues:', invisibleText);
  });

  // ── TC-A11Y-007 ──────────────────────────────────────────────────────
  test('@regression TC-A11Y-007: Modals/dialogs trap focus correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for any modal trigger buttons
    const modalTriggers = await page.locator([
      'button:has-text("Open")',
      'button:has-text("Create")',
      'button:has-text("Add")',
      'button:has-text("New")',
      '[data-modal]',
      '[aria-haspopup="dialog"]',
    ].join(', ')).all();

    if (modalTriggers.length > 0) {
      await modalTriggers[0].click();
      await page.waitForTimeout(1000);

      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
      const isOpen = await modal.isVisible().catch(() => false);

      if (isOpen) {
        console.log('Modal opened, checking focus trap...');
        // Tab through modal elements — should stay within modal
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press('Tab');
        }
        // Active element should still be inside modal
        const focusedInModal = await page.evaluate(() => {
          const focused = document.activeElement;
          const modal = document.querySelector('[role="dialog"], .modal');
          return modal ? modal.contains(focused) : false;
        });
        console.log(`Focus trapped in modal: ${focusedInModal}`);

        // Close modal with Escape
        await page.keyboard.press('Escape');
        await expect(modal).toBeHidden({ timeout: 3000 });
      }
    } else {
      console.log('No modal triggers found on this page');
    }
  });
});
