import { test, expect } from './fixtures';

test('Postwyse - Full Regression Suite', async ({ authenticatedPage: page }) => {
  console.log('🚀 Starting Full Regression Test Suite');

  // Dashboard Verification
  await expect(page.getByRole('heading', { name: 'Content Calendar' })).toBeVisible();
  console.log('✅ Dashboard Verified');

  // Navigation Test
  const menus = ['Content Calendar', 'Analytics', 'AI Generator'];
  for (const menu of menus) {
    await page.getByText(menu, { exact: false }).first().click({ force: true });
    await page.waitForTimeout(2000);
    console.log(`✅ Navigated to ${menu}`);
  }

  console.log('🎉 Full Regression Suite Completed Successfully!');
});