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
  webServer: {
    // build:server must run before e2e so that dist/apps/api-server/main.js exists.
    // reuseExistingServer:true reuses a running server so repeated runs skip the build.
    command: 'npm run build:server && npm run start',
    cwd: path.join(__dirname, '..'),
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 180_000,
    ignoreHTTPSErrors: true,
  },
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
