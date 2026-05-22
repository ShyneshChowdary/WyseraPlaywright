import { test, expect } from './fixtures';

test('Postwyse - New Post Form Diagnostic', async ({ authenticatedPage: page }) => {
  test.setTimeout(60000);

  await page.waitForLoadState('networkidle');

  // Go directly to dashboard
  await page.goto('https://postwyse.com/dashboard');
  await page.waitForLoadState('networkidle');

  // Click New Post
  const newPostBtn = page.getByRole('button', { name: /^new post$/i }).first();
  await newPostBtn.waitFor({ state: 'visible', timeout: 15000 });
  await newPostBtn.click({ force: true });
  console.log('✅ New Post Opened');

  // Wait for anything to appear
  await page.waitForTimeout(3000);

  // ===== CHECK ALL FORM ELEMENTS =====
  const textareas = await page.locator('textarea').allTextContents();
  console.log('📋 Textareas found:', textareas.length, textareas);

  const inputs = await page.locator('input').all();
  console.log('📋 Inputs found:', inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const placeholder = await inputs[i].getAttribute('placeholder');
    const type = await inputs[i].getAttribute('type');
    const name = await inputs[i].getAttribute('name');
    console.log(`  Input[${i}] → type: ${type}, name: ${name}, placeholder: ${placeholder}`);
  }

  // ===== CHECK CONTENTEDITABLE (rich text editors) =====
  const editableDivs = await page.locator('[contenteditable="true"]').all();
  console.log('✏️ Contenteditable divs found:', editableDivs.length);
  for (let i = 0; i < editableDivs.length; i++) {
    const tag = await editableDivs[i].evaluate(el => el.tagName);
    const cls = await editableDivs[i].evaluate(el => el.className);
    const placeholder = await editableDivs[i].getAttribute('placeholder');
    console.log(`  Editable[${i}] → tag: ${tag}, class: ${cls}, placeholder: ${placeholder}`);
  }

  // ===== CHECK ALL BUTTONS IN MODAL =====
  const buttons = await page.locator('button').allTextContents();
  console.log('🔘 Buttons in form:', buttons);

  // ===== PRINT FULL MODAL HTML =====
  const bodyText = await page.locator('body').innerText();
  console.log('📄 Page text after New Post click:\n', bodyText.substring(0, 800));
});