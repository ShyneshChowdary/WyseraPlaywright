import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../postwyse.env') });

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('https://postwyse.com/login');
    await loginPage.login(process.env.EMAIL!, process.env.PASSWORD!);
    await use(page);
  },
});

export { expect } from '@playwright/test';