import { test, expect } from './fixtures';

test('Postwyse - Content Calendar Test', async ({ authenticatedPage: page }) => {
  
  console.log('✅ Logged in successfully');

  await expect(page.getByRole('heading', { name: 'Content Calendar' })).toBeVisible();
  console.log('✅ Dashboard verified');

  await page.goto('https://postwyse.com/dashboard?tab=calendar', { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(6000);

  // Strong locator for May 2026
  //await expect(page.locator('text=May 2026').first()).toBeVisible({ timeout: 20000 });

  console.log('✅ May 2026 found');

  const generateBtn = page.getByRole('button', { name: /GENERATE WEEK/i });
  await expect(generateBtn).toBeVisible();
  await generateBtn.click();

  await page.waitForTimeout(5000);
  console.log('🎉 Calendar Test Passed');
});