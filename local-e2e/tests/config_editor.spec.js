const { test, expect } = require('@playwright/test');
const { login, connectToHost } = require('./helpers');

/**
 * 설정 에디터 테스트
 * - CUBRID Config: 열기, 내용 로드, 편집 후 저장, 원복
 * - Broker Config: 열기, 내용 로드, 편집 후 저장, 원복
 */
test.describe('Config Editor', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  // ─── CUBRID Config ────────────────────────────────────────────────────────

  test('호스트 우클릭 → CUBRID Config 에디터가 열린다', async ({ page }) => {
    const hostItem = page.locator('#host-section div[title*=":"]').first();
    await hostItem.click({ button: 'right' });
    await page.getByRole('button', { name: /CUBRID Config|cubrid\.conf/i }).click();

    await expect(
      page.getByText(/cubrid\.conf|CUBRID Config/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('CUBRID Config 에디터에 cubrid.conf 실제 내용이 로드된다', async ({ page }) => {
    const hostItem = page.locator('#host-section div[title*=":"]').first();
    await hostItem.click({ button: 'right' });
    await page.getByRole('button', { name: /CUBRID Config|cubrid\.conf/i }).click();

    // 에디터에 실제 파라미터 내용이 있어야 함
    const editor = page.locator('textarea, .cm-editor, .CodeMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByText(/\[common\]|max_clients|data_buffer_pages|sort_buffer_pages/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('CUBRID Config: 내용을 수정하고 저장하면 성공 메시지가 표시된다', async ({ page }) => {
    const hostItem = page.locator('#host-section div[title*=":"]').first();
    await hostItem.click({ button: 'right' });
    await page.getByRole('button', { name: /CUBRID Config|cubrid\.conf/i }).click();

    const editor = page.locator('textarea, .cm-editor .cm-content, .CodeMirror-code').first();
    await expect(editor).toBeVisible({ timeout: 10000 });

    // 에디터 포커스 후 끝으로 이동하여 주석 한 줄 추가 (무해한 변경)
    await editor.click();
    await page.keyboard.press('Control+End');
    await page.keyboard.press('End');
    await page.keyboard.type('\n# e2e-test-marker');

    const saveBtn = page.getByRole('button', { name: /Save/i }).first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // 저장 성공 확인
    await expect(
      page.getByText(/success|saved|저장/i).first()
        .or(page.locator('[class*="toast"], [class*="alert"]').first())
    ).toBeVisible({ timeout: 10000 });

    // ── 원복: 추가한 주석 줄 제거 ────────────────────────────────────────────
    await editor.click();
    await page.keyboard.press('Control+End');
    // 마지막 줄(# e2e-test-marker) 선택 후 삭제
    await page.keyboard.press('Home');
    await page.keyboard.press('Shift+End');
    await page.keyboard.press('Backspace'); // 줄 내용 삭제
    await page.keyboard.press('Backspace'); // 줄 자체 삭제 (개행 포함)
    await saveBtn.click();
    await expect(
      page.getByText(/success|saved|저장/i).first()
        .or(page.locator('[class*="toast"], [class*="alert"]').first())
    ).toBeVisible({ timeout: 10000 });
  });

  // ─── Broker Config ────────────────────────────────────────────────────────

  test('Broker 탭 루트 우클릭 → Broker Config 에디터가 열린다', async ({ page }) => {
    // Broker Config는 TreeTabHeader의 Broker 탭 버튼을 우클릭하면 나타남
    // tab button 텍스트는 material icon "hub"가 붙으므로 /Broker/i 사용 (^Broker$ 아님)
    await page.locator('#tree-section-container').getByRole('button', { name: /Broker/i })
      .click({ button: 'right' });
    await page.getByRole('button', { name: /Broker Config|cubrid_broker\.conf/i }).click();

    await expect(
      page.getByText(/cubrid_broker\.conf|Broker Config/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('Broker Config 에디터에 cubrid_broker.conf 섹션이 실제로 로드된다', async ({ page }) => {
    await page.locator('#tree-section-container').getByRole('button', { name: /Broker/i })
      .click({ button: 'right' });
    await page.getByRole('button', { name: /Broker Config|cubrid_broker\.conf/i }).click();

    // 실제 broker.conf 내용 확인
    await expect(
      page.getByText(/\[broker\]|\[%query_editor\]|BROKER_PORT|MIN_NUM_APPL_SERVER/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('Broker Config: 내용을 수정하고 저장하면 성공 메시지가 표시된다', async ({ page }) => {
    await page.locator('#tree-section-container').getByRole('button', { name: /Broker/i })
      .click({ button: 'right' });
    await page.getByRole('button', { name: /Broker Config|cubrid_broker\.conf/i }).click();

    const editor = page.locator('textarea, .cm-editor .cm-content, .CodeMirror-code').first();
    await expect(editor).toBeVisible({ timeout: 10000 });

    await editor.click();
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

    // ── 원복 ─────────────────────────────────────────────────────────────────
    await editor.click();
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
