import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../postwyse.env') });

test('Postwyse - Login Test', async ({ page }) => {
  const loginPage = new LoginPage(page);

  console.log('🔑 Email from env:', process.env.EMAIL);

  if (!process.env.EMAIL || !process.env.PASSWORD) {
    throw new Error('❌ Credentials not found in postwyse.env file!');
  }

  // Use full URL instead of relative path
  await loginPage.goto('https://postwyse.com/login');
  await loginPage.login(process.env.EMAIL!, process.env.PASSWORD!);
});