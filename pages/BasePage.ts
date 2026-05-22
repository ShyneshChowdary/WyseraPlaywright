import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async goto(url: string) {
    // Support both relative and full URLs
    const fullUrl = url.startsWith('http') ? url : `https://postwyse.com${url}`;
    await this.page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }
}