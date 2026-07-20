const { test, expect } = require('@playwright/test');
const { AuthPage } = require('../pages/AuthPage');
const { HostTreePage } = require('../pages/HostTreePage');
const { DatabaseTreePage } = require('../pages/DatabaseTreePage');

const E2E_HOST_ADDRESS = process.env.E2E_HOST_ADDRESS || 'localhost';
const E2E_HOST_PORT = process.env.E2E_HOST_PORT || '8001';
const E2E_DB = process.env.E2E_DB || 'demodb';

test.describe('Database Query Plan', () => {
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

  test('쿼리 계획을 생성하면 트리에 나타나고, 수정 후 삭제하면 사라진다', async ({ page }) => {
    const jobFolder = await dbTree.expandSubNode(E2E_DB, 'Job automation');
    const planFolder = jobFolder.getByTestId('tree-node-Query Plan');
    await expect(planFolder).toBeVisible({ timeout: 10000 });
    await planFolder.locator('> summary').click({ button: 'right' });
    await page.getByRole('button', { name: 'Add Query Plan' }).click();

    const addModal = page.getByTestId('add-query-plan-modal');
    await expect(addModal).toBeVisible();
    const queryId = `e2e_query_${Date.now().toString().slice(-6)}`;
    await addModal.locator('input').first().fill(queryId);
    // The CMS task rejects an empty userpass ("Parameter(userpass) missing"),
    // even for the passwordless "public" account — any non-empty value works.
    await addModal.locator('input[type="password"]').fill('public');
    // SQL field is a Monaco editor, not a plain textarea — click into it and type.
    await addModal.locator('.monaco-editor').click();
    await page.keyboard.type('SELECT 1 FROM db_root;');
    await page.getByTestId('add-query-plan-save-btn').click();

    await expect(page.getByText(/Query Plan Added/i).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /OK/ }).click();

    const isOpen = await planFolder.evaluate((el) => el.open).catch(() => false);
    if (!isOpen) await planFolder.locator('> summary').click();
    const planItem = dbTree.planItem(E2E_DB, queryId);
    await expect(planItem).toBeVisible({ timeout: 10000 });

    // Edit: reopen its context menu and save without changes.
    await planItem.click({ button: 'right' });
    await page.getByRole('button', { name: 'Edit Query Plan' }).click();
    const editModal = page.getByTestId('edit-query-plan-modal');
    await expect(editModal).toBeVisible();
    await page.getByTestId('edit-query-plan-save-btn').click();
    await expect(page.getByText(/Update Successful/i).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /OK/ }).click();

    // Cleanup
    await planItem.click({ button: 'right' });
    await page.getByRole('button', { name: 'Remove' }).click();
    const deleteModal = page.getByTestId('delete-query-plan-modal');
    await expect(deleteModal).toBeVisible();
    await page.getByTestId('delete-query-plan-confirm-btn').click();
    // No confirm button here — this modal auto-closes ~1s after success.
    await expect(page.getByText(/Deletion Success/i).first()).toBeVisible({ timeout: 15000 });
    await expect(deleteModal).not.toBeVisible({ timeout: 5000 });

    await expect(planItem).not.toBeVisible({ timeout: 10000 });
  });
});
