import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load custom env file
dotenv.config({ path: path.resolve(__dirname, 'postwyse.env') });

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [['html'], ['list']],

  use: {
  baseURL: 'https://postwyse.com',
  headless: false,
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry',
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 15000,     // Add this
  navigationTimeout: 30000  // Add this
},

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});