const { test, expect } = require('@playwright/test');

/**
 * Async Job (CmsJob) E2E Test Suite
 *
 * Tests the background job tracking flow:
 *   Submit long-running operation → job appears in BackgroundJobsPanel
 *   → panel shows running state → job completes (succeeded/failed)
 *
 * Requirements:
 *   - Running server with at least one CUBRID host registered
 *   - E2E_USERNAME, E2E_PASSWORD, E2E_HOST_LABEL in local-e2e/.env
 *   - At least one database on the host (uses demodb by default)
 */

const E2E_DB = process.env.E2E_DB || 'demodb';
const JOB_TIMEOUT = 5 * 60 * 1000; // 5 minutes max for optimize

async function login(page) {
  await page.goto('/');
  await page.getByPlaceholder(/Enter username/i).fill(process.env.E2E_USERNAME);
  await page.getByPlaceholder(/••••••••/).fill(process.env.E2E_PASSWORD);
  await page.getByRole('button', { name: /Authorize Access/i }).click();
  await expect(page).not.toHaveURL(/login/, { timeout: 10000 });
}

async function selectFirstHost(page) {
  const firstHost = page.locator('#host-section div[title*=":"]').first();
  await firstHost.click();
}

test.describe('Async Job Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await selectFirstHost(page);
  });

  test('background jobs panel appears when a job is submitted', async ({ page }) => {
    // Find database in tree
    const dbNode = page.locator('#db-tree-container')
      .locator('div')
      .filter({ hasText: new RegExp(`^${E2E_DB}$`) })
      .first();
    await expect(dbNode).toBeVisible({ timeout: 10000 });

    // Open context menu → Optimize
    await dbNode.click({ button: 'right' });
    const optimizeBtn = page.getByRole('button', { name: /Optimize/i });
    await expect(optimizeBtn).toBeVisible();
    await optimizeBtn.click();

    // Optimize modal should open
    const modal = page.locator('[role="dialog"]').filter({ hasText: /Optim/i });
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Submit
    const submitBtn = modal.getByRole('button', { name: /Execute|Optim|OK|확인/i }).last();
    await submitBtn.click();

    // Background jobs panel should appear with an active job
    const panel = page.locator('#sidebar-background-jobs');
    await expect(panel).toBeVisible({ timeout: 10000 });

    // Panel should show a spinning (active) icon
    const spinner = panel.locator('.animate-spin');
    await expect(spinner).toBeVisible({ timeout: 5000 });
  });

  test('job in panel transitions to succeeded or failed', async ({ page }) => {
    const dbNode = page.locator('#db-tree-container')
      .locator('div')
      .filter({ hasText: new RegExp(`^${E2E_DB}$`) })
      .first();
    await expect(dbNode).toBeVisible({ timeout: 10000 });

    await dbNode.click({ button: 'right' });
    await page.getByRole('button', { name: /Optimize/i }).click();

    const modal = page.locator('[role="dialog"]').filter({ hasText: /Optim/i });
    await expect(modal).toBeVisible({ timeout: 5000 });
    await modal.getByRole('button', { name: /Execute|Optim|OK|확인/i }).last().click();

    const panel = page.locator('#sidebar-background-jobs');
    await expect(panel).toBeVisible({ timeout: 10000 });

    // Wait for spinner to disappear (job finished)
    await expect(panel.locator('.animate-spin')).toHaveCount(0, { timeout: JOB_TIMEOUT });

    // Should show success or failure icon — either is fine, as long as it's terminal
    const successIcon = panel.locator('[aria-label*="check"], .text-green-500');
    const failIcon = panel.locator('[aria-label*="error"], .text-red-500');
    const isTerminal = (await successIcon.count()) > 0 || (await failIcon.count()) > 0;
    expect(isTerminal).toBe(true);
  });

  test('elapsed time is shown while job is running', async ({ page }) => {
    const dbNode = page.locator('#db-tree-container')
      .locator('div')
      .filter({ hasText: new RegExp(`^${E2E_DB}$`) })
      .first();
    await expect(dbNode).toBeVisible({ timeout: 10000 });

    await dbNode.click({ button: 'right' });
    await page.getByRole('button', { name: /Optimize/i }).click();

    const modal = page.locator('[role="dialog"]').filter({ hasText: /Optim/i });
    await expect(modal).toBeVisible({ timeout: 5000 });
    await modal.getByRole('button', { name: /Execute|Optim|OK|확인/i }).last().click();

    const panel = page.locator('#sidebar-background-jobs');
    await expect(panel).toBeVisible({ timeout: 10000 });

    // Elapsed time label should appear while running (e.g. "0s", "1s", "1m 2s")
    const elapsed = panel.locator('.tabular-nums');
    await expect(elapsed).toBeVisible({ timeout: 5000 });
    // Content should match time format
    await expect(elapsed).toHaveText(/\d+s|\d+m/, { timeout: 5000 });
  });

  test('toast notification appears after job completes', async ({ page }) => {
    const dbNode = page.locator('#db-tree-container')
      .locator('div')
      .filter({ hasText: new RegExp(`^${E2E_DB}$`) })
      .first();
    await expect(dbNode).toBeVisible({ timeout: 10000 });

    await dbNode.click({ button: 'right' });
    await page.getByRole('button', { name: /Optimize/i }).click();

    const modal = page.locator('[role="dialog"]').filter({ hasText: /Optim/i });
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Close modal after submitting to let it run in background
    await modal.getByRole('button', { name: /Execute|Optim|OK|확인/i }).last().click();

    // Wait for job to finish
    const panel = page.locator('#sidebar-background-jobs');
    await expect(panel).toBeVisible({ timeout: 10000 });
    await expect(panel.locator('.animate-spin')).toHaveCount(0, { timeout: JOB_TIMEOUT });

    // Toast should have appeared (success or failure message)
    // Toast container is usually role="status" or has specific class
    const toast = page.locator('[role="status"], [class*="toast"], [class*="notification"]').last();
    await expect(toast).toBeVisible({ timeout: 5000 });
  });
});
