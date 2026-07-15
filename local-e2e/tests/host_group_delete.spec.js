const { test, expect } = require('@playwright/test');
const { AuthPage } = require('../pages/AuthPage');

test.describe('Group Delete', () => {
  test.beforeEach(async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.login(process.env.E2E_USERNAME, process.env.E2E_PASSWORD);
  });

  async function createGroup(page, groupName) {
    await page.getByTestId('new-group-toolbar-btn').click();
    const modal = page.getByTestId('group-name-modal');
    await modal.locator('input[name="groupName"]').fill(groupName);
    await page.getByTestId('group-name-submit-btn').click();
    await expect(modal).not.toBeVisible({ timeout: 10000 });
  }

  test('그룹을 삭제하면 목록에서 사라진다', async ({ page }) => {
    const groupName = `E2E_GroupDel_${Date.now().toString().slice(-6)}`;
    await createGroup(page, groupName);

    const group = page.locator('#host-section').locator('details').filter({ hasText: groupName }).first();
    await expect(group).toBeVisible({ timeout: 10000 });
    await group.locator('> summary').click({ button: 'right' });
    await page.getByRole('button', { name: /Delete Group/i }).click();

    const modal = page.getByTestId('delete-group-modal');
    await expect(modal).toBeVisible();
    await page.getByTestId('delete-group-confirm-btn').click();
    await expect(modal).not.toBeVisible({ timeout: 10000 });

    await expect(page.locator('#host-section').getByText(groupName)).not.toBeVisible({ timeout: 5000 });
  });

  test('삭제 취소를 누르면 그룹이 유지된다', async ({ page }) => {
    const groupName = `E2E_GroupKeep_${Date.now().toString().slice(-6)}`;
    await createGroup(page, groupName);

    const group = page.locator('#host-section').locator('details').filter({ hasText: groupName }).first();
    await group.locator('> summary').click({ button: 'right' });
    await page.getByRole('button', { name: /Delete Group/i }).click();

    const modal = page.getByTestId('delete-group-modal');
    await page.getByTestId('delete-group-cancel-btn').click();
    await expect(modal).not.toBeVisible();
    await expect(page.locator('#host-section').getByText(groupName)).toBeVisible();
  });
});
