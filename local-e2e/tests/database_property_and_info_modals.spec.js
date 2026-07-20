const { test, expect } = require('@playwright/test');
const { AuthPage } = require('../pages/AuthPage');
const { HostTreePage } = require('../pages/HostTreePage');
const { DatabaseTreePage } = require('../pages/DatabaseTreePage');

const E2E_HOST_ADDRESS = process.env.E2E_HOST_ADDRESS || 'localhost';
const E2E_HOST_PORT = process.env.E2E_HOST_PORT || '8001';
const E2E_DB = process.env.E2E_DB || 'demodb';

test.describe('Database Property and Info Modals', () => {
  let dbTree;

  test.beforeEach(async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.login(process.env.E2E_USERNAME, process.env.E2E_PASSWORD);

    const hostTree = new HostTreePage(page);
    const host = hostTree.hostRowByConnection(E2E_HOST_ADDRESS, E2E_HOST_PORT);
    await expect(host).toBeVisible({ timeout: 10000 });
    await host.dblclick();
    dbTree = new DatabaseTreePage(page);
    await dbTree.waitForAuthorized();
  });

  // Properties modal edits the host's real cubrid.conf on Apply — only
  // verify it opens with content and discard, never actually apply.
  test('Properties 모달이 열리고, 적용하지 않고 닫을 수 있다', async ({ page }) => {
    await dbTree.openContextMenu(E2E_DB);
    await page.getByRole('button', { name: 'Properties' }).click();

    const modal = page.getByTestId('database-property-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await expect(modal.getByText(E2E_DB).first()).toBeVisible();

    await page.getByTestId('database-property-discard-btn').click();
    await expect(modal).not.toBeVisible();
  });

  // Param Dump is a read-only backend call — safe to run for real.
  test('Database Info > Param Dump 실행하면 파라미터 테이블이 표시된다', async ({ page }) => {
    await dbTree.openContextMenu(E2E_DB);
    await page.getByRole('button', { name: 'Database Info' }).hover();
    await page.getByRole('button', { name: /Param Dump/ }).click();

    const modal = page.getByTestId('database-info-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    await page.getByTestId('database-info-run-btn').click();
    await expect(modal.locator('table')).toBeVisible({ timeout: 15000 });
    await expect(modal.locator('table tbody tr').first()).toBeVisible();

    await page.getByTestId('database-info-close-btn').click();
    await expect(modal).not.toBeVisible();
  });
});
