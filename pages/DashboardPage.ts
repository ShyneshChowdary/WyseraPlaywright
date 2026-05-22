import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class DashboardPage extends BasePage {
  async verifyLoaded() {
    await expect(this.page.getByText('Content Calendar')).toBeVisible({ timeout: 15000 });
    console.log('✅ Dashboard Loaded');
  }
}