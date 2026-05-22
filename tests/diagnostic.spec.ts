import { test, expect } from './fixtures';

test('Postwyse - Deep Diagnostic', async ({ authenticatedPage: page }) => {
  await page.waitForLoadState('networkidle');
  console.log('📍 URL:', page.url());

  // ===== FIND AI GENERATOR BUTTON =====
  const aiBtn = page.getByRole('button', { name: /ai generator/i });
  const count = await aiBtn.count();
  console.log('🔎 AI Generator button count:', count);

  if (count === 0) {
    console.log('❌ CRITICAL: AI Generator button NOT found by role');
    // Try alternate
    const allBtns = await page.locator('button').allTextContents();
    const aiMatch = allBtns.filter(t => t.toLowerCase().includes('ai generator'));
    console.log('🔎 Buttons containing "ai generator":', aiMatch);
  }

  // ===== CLICK AND LOG EVERYTHING =====
  await aiBtn.click({ force: true });
  console.log('✅ Clicked AI Generator');

  // Wait 5 seconds and observe what changed
  await page.waitForTimeout(5000);

  console.log('📍 URL after 5s:', page.url());

  const h1s = await page.locator('h1').allTextContents();
  console.log('📝 H1s after click:', h1s);

  const h2s = await page.locator('h2').allTextContents();
  console.log('📝 H2s after click:', h2s);

  const textareaCount = await page.locator('textarea').count();
  console.log('📋 Textarea count after click:', textareaCount);

  const inputCount = await page.locator('input').count();
  console.log('📋 Input count after click:', inputCount);

  // ===== CHECK IF PAGE CHANGED AT ALL =====
  const bodyText = await page.locator('body').innerText();
  const hasAIContent = bodyText.includes('AI Content') || 
                       bodyText.includes('Generate content') || 
                       bodyText.includes('actually ships');
  console.log('🧠 AI Generator content visible?', hasAIContent);
  console.log('📄 Body snippet after click:', bodyText.substring(0, 500));

  // ===== CHECK FOR IFRAMES =====
  const iframes = page.frames();
  console.log('🖼️ Total frames/iframes:', iframes.length);
  for (const frame of iframes) {
    console.log('  Frame URL:', frame.url());
  }

  // ===== CHECK NETWORK REQUESTS AFTER CLICK =====
  page.on('request', req => {
    if (req.url().includes('ai') || req.url().includes('generator')) {
      console.log('🌐 Network request:', req.url());
    }
  });

  // Click again and monitor network
  await aiBtn.click({ force: true });
  await page.waitForTimeout(3000);

  console.log('🎉 Deep Diagnostic Complete');
});