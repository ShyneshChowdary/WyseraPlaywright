import { test, expect } from './fixtures';

test('Postwyse - Analytics Dashboard Test', async ({ authenticatedPage: page }) => {

  // ===== OPEN ANALYTICS =====
  await page.getByText('Analytics', { exact: false })
    .first()
    .click({ force: true });

  // Wait for page render
  await page.waitForTimeout(4000);

  // ===== VERIFY ANALYTICS PAGE =====
  await expect(
    page.getByRole('heading', { name: 'Analytics' })
  ).toBeVisible({
    timeout: 15000
  });

  console.log('✅ Analytics Dashboard Loaded');

  // ===== VERIFY ANALYTICS DATA =====
  await expect(
    page.locator('body')
  ).toContainText(
    /Posts|Engagement|Impressions|Reach/i,
    { timeout: 15000 }
  );

  console.log('🎉 Analytics Test Passed');
});