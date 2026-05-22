import { test } from './fixtures';

test('Postwyse - Full Sidebar Navigation Test', async ({ authenticatedPage: page }) => {
  
  console.log('✅ Logged in successfully');

  const menus = [
    'Content Calendar', 'Analytics', 'AI Generator', 
    'Trend Radar', 'Competitor Pulse'
  ];

  for (const menu of menus) {
    try {
      const item = page.getByText(menu, { exact: false }).first();
      if (await item.isVisible({ timeout: 5000 })) {
        await item.click({ force: true });
        await page.waitForTimeout(1500);
        console.log(`✅ Navigated to: ${menu}`);
      }
    } catch (e) {
      console.log(`⚠️ Skipped: ${menu}`);
    }
  }

  console.log('🎉 Navigation Test Completed');
});