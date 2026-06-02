const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Load environment variables natively (Node.js 20.12+)
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
} catch (e) {
  // .env might not exist, ignore silently
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  webServer: [
    {
      // Frontend — Vite dev server
      command: 'npm run dev:web-manager',
      cwd: path.join(__dirname, '..'),
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      // API server — NestJS (dev mode, CORS allows *)
      command: 'npm run dev:api-server',
      cwd: path.join(__dirname, '..'),
      url: 'https://localhost:8080',
      reuseExistingServer: true,
      timeout: 120_000,
      ignoreHTTPSErrors: true,
    },
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
