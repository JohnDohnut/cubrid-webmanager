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
// Default to the single-server URL (npm run start → https://localhost:8080).
// Override via BASE_URL in local-e2e/.env for other setups.
const BASE_URL = process.env.BASE_URL || 'https://localhost:8080';

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000,
  // webServer 블록 없음 — npm run stack (또는 npm run dev:stack)을 먼저 실행한 뒤 playwright를 시작하세요.
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
