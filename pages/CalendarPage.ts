import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class CalendarPage extends BasePage {
  async verifyCalendar() {
    await expect(this.page.locator('text=May 2026')).toBeVisible();
    await expect(this.page.getByRole('button', { name: /GENERATE WEEK/i })).toBeVisible();
    console.log('✅ Content Calendar verified');
  }

  async clickGenerateWeek() {
    await this.page.getByRole('button', { name: /GENERATE WEEK/i }).click();
    await this.page.waitForTimeout(3000);
  }
}