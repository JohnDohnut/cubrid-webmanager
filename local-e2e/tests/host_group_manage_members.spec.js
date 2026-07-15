const { test, expect } = require('@playwright/test');
const { AuthPage } = require('../pages/AuthPage');

const E2E_HOST_ADDRESS = process.env.E2E_HOST_ADDRESS || 'localhost';
const E2E_HOST_PORT = process.env.E2E_HOST_PORT || '8001';

test.describe('Manage Group Members', () => {
  test.beforeEach(async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.login(process.env.E2E_USERNAME, process.env.E2E_PASSWORD);
  });

  test('체크된 호스트를 그룹에 추가하고, 체크 해제하면 미분류로 이동한다', async ({ page }) => {
    const groupName = `E2E_GroupMembers_${Date.now().toString().slice(-6)}`;

    await page.getByTestId('new-group-toolbar-btn').click();
    let modal = page.getByTestId('group-name-modal');
    await modal.locator('input[name="groupName"]').fill(groupName);
    await page.getByTestId('group-name-submit-btn').click();
    await expect(modal).not.toBeVisible({ timeout: 10000 });

    const group = page.locator('#host-section').locator('details').filter({ hasText: groupName }).first();
    await expect(group).toBeVisible({ timeout: 10000 });
    await group.locator('> summary').click({ button: 'right' });
    await page.getByRole('button', { name: /Manage Group/i }).click();

    modal = page.getByTestId('manage-group-members-modal');
    await expect(modal).toBeVisible();
    await modal.locator(`tr:has-text("${E2E_HOST_ADDRESS}")`).locator('[data-testid^="manage-group-members-checkbox-"]').click();
    await page.getByTestId('manage-group-members-save-btn').click();
    await expect(modal).not.toBeVisible({ timeout: 10000 });

    // Moving a host into a group doesn't auto-expand it — open it to check membership.
    const isOpenAfterMove = await group.evaluate((el) => el.open);
    if (!isOpenAfterMove) await group.locator('> summary').click();
    await expect(group.locator(`[title="${E2E_HOST_ADDRESS}:${E2E_HOST_PORT}"]`)).toBeVisible({ timeout: 10000 });

    // Uncheck it again — should move back to Ungrouped.
    await group.locator('> summary').click({ button: 'right' });
    await page.getByRole('button', { name: /Manage Group/i }).click();
    modal = page.getByTestId('manage-group-members-modal');
    await modal.locator(`tr:has-text("${E2E_HOST_ADDRESS}")`).locator('[data-testid^="manage-group-members-checkbox-"]').click();
    await page.getByTestId('manage-group-members-save-btn').click();
    await expect(modal).not.toBeVisible({ timeout: 10000 });

    await expect(group.locator(`[title="${E2E_HOST_ADDRESS}:${E2E_HOST_PORT}"]`)).not.toBeVisible({ timeout: 5000 });
  });
});
