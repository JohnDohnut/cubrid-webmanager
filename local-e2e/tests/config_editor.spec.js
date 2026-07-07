const { test, expect } = require('@playwright/test');
const { login, connectToHost } = require('./helpers');

/**
 * 설정 에디터 테스트
 *
 * CUBRID Config 접근 경로:
 *   Header nav → "Host Service Management" dropdown
 *     → hover "Config Param" submenu
 *       → click "Edit Cubrid Config"
 *
 * Broker Config 접근 경로:
 *   Sidebar → Broker 탭 버튼 우클릭 → "Edit Broker Config"
 */
test.describe('Config Editor', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  // ─── 공통 헬퍼 ───────────────────────────────────────────────────────────

  async function openCubridConfig(page) {
    // Header nav: "Host Service Management" > "Config Param" (SubMenu) > "Edit Cubrid Config"
    await page.getByRole('button', { name: /Host Service Management/i }).click();
    await page.getByRole('button', { name: /Config Param/i }).hover();
    await page.getByRole('button', { name: /Edit Cubrid Config/i }).click();
  }

  async function openBrokerConfig(page) {
    // Sidebar: Broker tab right-click → "Edit Broker Config"
    await page.locator('#tree-section-container').getByRole('button', { name: /Broker/i })
      .click({ button: 'right' });
    await page.getByRole('button', { name: /Broker Config|Edit.*Config|cubrid_broker/i }).click();
  }

  // ─── CUBRID Config ────────────────────────────────────────────────────────

  test('Header 메뉴 → CUBRID Config 에디터가 열린다', async ({ page }) => {
    await openCubridConfig(page);

    await expect(
      page.getByText(/cubrid\.conf|CUBRID Config|Edit Cubrid Config/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('CUBRID Config 에디터에 cubrid.conf 실제 내용이 로드된다', async ({ page }) => {
    await openCubridConfig(page);

    const editor = page.locator('textarea, .cm-editor, .CodeMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByText(/\[common\]|max_clients|data_buffer_pages|sort_buffer_pages/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('CUBRID Config: 내용을 수정하고 저장하면 성공 메시지가 표시된다', async ({ page }) => {
    await openCubridConfig(page);

    const editor = page.locator('textarea, .cm-editor .cm-content, .CodeMirror-code').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    // force: true bypasses any animation overlay that might block pointer events
    await editor.click({ force: true });
    await page.keyboard.press('Control+End');
    await page.keyboard.press('End');
    await page.keyboard.type('\n# e2e-test-marker');

    const saveBtn = page.getByRole('button', { name: /Save/i }).first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    await expect(
      page.getByText(/success|saved|저장/i).first()
        .or(page.locator('[class*="toast"], [class*="alert"]').first())
    ).toBeVisible({ timeout: 10000 });

    // ── 원복 ──────────────────────────────────────────────────────────────────
    await editor.click({ force: true });
    await page.keyboard.press('Control+End');
    await page.keyboard.press('Home');
    await page.keyboard.press('Shift+End');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await saveBtn.click();
    await expect(
      page.getByText(/success|saved|저장/i).first()
        .or(page.locator('[class*="toast"], [class*="alert"]').first())
    ).toBeVisible({ timeout: 10000 });
  });

  // ─── Broker Config ────────────────────────────────────────────────────────

  test('Broker 탭 루트 우클릭 → Broker Config 에디터가 열린다', async ({ page }) => {
    await openBrokerConfig(page);

    await expect(
      page.getByText(/cubrid_broker\.conf|Broker Config/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('Broker Config 에디터에 cubrid_broker.conf 섹션이 실제로 로드된다', async ({ page }) => {
    await openBrokerConfig(page);

    await expect(
      page.getByText(/\[broker\]|\[%query_editor\]|BROKER_PORT|MIN_NUM_APPL_SERVER/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('Broker Config: 내용을 수정하고 저장하면 성공 메시지가 표시된다', async ({ page }) => {
    await openBrokerConfig(page);

    const editor = page.locator('textarea, .cm-editor .cm-content, .CodeMirror-code').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    // force: true bypasses the dialog's fade-in backdrop overlay that blocks pointer events
    await editor.click({ force: true });
    await page.keyboard.press('Control+End');
    await page.keyboard.press('End');
    await page.keyboard.type('\n# e2e-test-marker');

    const saveBtn = page.getByRole('button', { name: /Save/i }).first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    await expect(
      page.getByText(/success|saved|저장/i).first()
        .or(page.locator('[class*="toast"], [class*="alert"]').first())
    ).toBeVisible({ timeout: 10000 });

    // ── 원복 ──────────────────────────────────────────────────────────────────
    await editor.click({ force: true });
    await page.keyboard.press('Control+End');
    await page.keyboard.press('Home');
    await page.keyboard.press('Shift+End');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await saveBtn.click();
    await expect(
      page.getByText(/success|saved|저장/i).first()
        .or(page.locator('[class*="toast"], [class*="alert"]').first())
    ).toBeVisible({ timeout: 10000 });
  });

});
