import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  async login(email: string, password: string) {
    await this.page.fill('input[type="email"], input[name*="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"], button:has-text("Sign"), button:has-text("Log")');
    
    await this.page.waitForURL('**/dashboard**', { timeout: 30000 });
    console.log('✅ Login Successful');
  }
}