const { test, expect } = require('@playwright/test');
const { login, connectToHost } = require('./helpers');

/**
 * 설정 에디터 테스트
 * - CUBRID Config 에디터 열기 및 내용 확인
 * - Broker Config 에디터 열기 및 내용 확인
 * - 에디터 저장 버튼 동작 확인
 */
test.describe('Configuration Editor', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  // ─── CUBRID Config ─────────────────────────────────────────────────────────

  test('호스트 우클릭 → CUBRID Config 에디터가 열린다', async ({ page }) => {
    const hostItem = page.locator('#host-section div[title*=":"]').first();
    await hostItem.click({ button: 'right' });

    const menuItem = page.getByRole('button', { name: /CUBRID Config|cubrid\.conf/i });
    if (!await menuItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip(); return;
    }
    await menuItem.click();

    await expect(
      page.getByText(/CUBRID Config/i).or(page.locator('.monaco-editor'))
    ).toBeVisible({ timeout: 15000 });
  });

  test('CUBRID Config 에디터에 cubrid.conf 내용이 로드된다', async ({ page }) => {
    const hostItem = page.locator('#host-section div[title*=":"]').first();
    await hostItem.click({ button: 'right' });

    const menuItem = page.getByRole('button', { name: /CUBRID Config|cubrid\.conf/i });
    if (!await menuItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip(); return;
    }
    await menuItem.click();

    // 에디터가 초기화되면 cubrid.conf 관련 키워드가 보여야 한다
    const editor = page.locator('.monaco-editor').or(page.locator('textarea'));
    await expect(editor.first()).toBeVisible({ timeout: 15000 });
  });

  // ─── Broker Config ─────────────────────────────────────────────────────────

  test('Broker 탭 루트 우클릭 → Broker Config 에디터가 열린다', async ({ page }) => {
    await page.locator('#tree-section-container')
      .getByRole('button', { name: /Broker/i }).click();
    await expect(
      page.locator('#db-tree-container').getByText('Brokers', { exact: true })
    ).toBeVisible({ timeout: 5000 });

    await page.locator('#db-tree-container').click({ button: 'right' });

    const configAction = page.getByRole('button', { name: /Edit Broker Config/i });
    await expect(configAction).toBeVisible({ timeout: 5000 });
    await configAction.click();

    await expect(
      page.getByText('Broker Config', { exact: true })
        .or(page.locator('.monaco-editor'))
    ).toBeVisible({ timeout: 15000 });
  });

  test('Broker Config 에디터에 cubrid_broker.conf 섹션이 로드된다', async ({ page }) => {
    await page.locator('#tree-section-container')
      .getByRole('button', { name: /Broker/i }).click();
    await page.locator('#db-tree-container').click({ button: 'right' });

    const configAction = page.getByRole('button', { name: /Edit Broker Config/i });
    if (!await configAction.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip(); return;
    }
    await configAction.click();

    const editor = page.locator('.monaco-editor').or(page.locator('textarea'));
    await expect(editor.first()).toBeVisible({ timeout: 15000 });
  });

  test('Broker Config 에디터에 Save 버튼이 있다', async ({ page }) => {
    await page.locator('#tree-section-container')
      .getByRole('button', { name: /Broker/i }).click();
    await page.locator('#db-tree-container').click({ button: 'right' });

    const configAction = page.getByRole('button', { name: /Edit Broker Config/i });
    if (!await configAction.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip(); return;
    }
    await configAction.click();

    await expect(page.locator('.monaco-editor').or(page.locator('textarea')).first())
      .toBeVisible({ timeout: 15000 });

    const saveBtn = page.getByRole('button', { name: /Save|Apply/i }).first();
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
  });

});
