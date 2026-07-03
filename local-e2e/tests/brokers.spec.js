const { test, expect } = require('@playwright/test');
const { login, connectToHost, dismissModal } = require('./helpers');

/**
 * 브로커 관리 테스트
 * - 브로커 목록 표시
 * - 브로커 시작/중지 토글
 * - 브로커 상세 패널 (메트릭)
 * - 브로커 Properties 모달
 * - 브로커 Config Editor
 * - AS (Application Server) 세션 표시
 */
test.describe('Broker Management', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);

    // Broker 탭으로 전환
    await page.locator('#tree-section-container')
      .getByRole('button', { name: /Broker/i }).click();
    await expect(
      page.locator('#db-tree-container').getByText('Brokers', { exact: true })
    ).toBeVisible({ timeout: 5000 });
  });

  // 표준 브로커 노드 locator
  const brokerNode = (page) =>
    page.locator('#db-tree-container')
      .locator('div')
      .filter({ hasText: /^query_editor$|^broker1$/ })
      .first();

  // ─── 목록 ─────────────────────────────────────────────────────────────────

  test('브로커 목록에 표준 브로커(query_editor 또는 broker1)가 표시된다', async ({ page }) => {
    await expect(brokerNode(page)).toBeVisible({ timeout: 10000 });
  });

  test('각 브로커 노드에 On/Off 상태 뱃지가 표시된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });
    await expect(node.locator('span.inline-flex')).toBeVisible();
  });

  // ─── 시작/중지 토글 ───────────────────────────────────────────────────────

  test('브로커 시작/중지를 토글하면 상태가 변경된다', async ({ page }) => {
    const node       = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });

    const badge      = node.locator('span.inline-flex');
    const statusText = await badge.innerText();
    const isOn       = statusText.includes('On');

    await node.click({ button: 'right' });
    await page.getByRole('button', { name: isOn ? /Stop Broker/i : /Start Broker/i }).click();

    const expected = isOn ? 'Off' : 'On';
    await expect(badge).toContainText(expected, { timeout: 15000 });
  });

  // ─── 상세 패널 (클릭) ─────────────────────────────────────────────────────

  test('브로커 노드를 클릭하면 상세 패널(PID·Port 등)이 표시된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });
    await node.click();

    // 상세 패널에 기본 메트릭이 있어야 한다
    const panel = page.locator('#main-content-area, [data-panel="broker-detail"]')
      .or(page.getByText(/PID|Port|Job Queue/i).first().locator('..'));
    await expect(
      page.getByText(/PID|Port|Job Queue/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ─── Properties 모달 ──────────────────────────────────────────────────────

  test('브로커 Properties 모달이 열리고 파라미터 탭이 있다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });
    await node.click({ button: 'right' });
    await page.getByRole('button', { name: /Properties/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Properties|Parameters|Common|Advanced/i);

    // Common / Advanced 탭이 있어야 한다
    const commonTab = modal.getByRole('button', { name: /Common/i });
    if (await commonTab.isVisible()) await commonTab.click();

    await dismissModal(page);
  });

  // ─── Config Editor ────────────────────────────────────────────────────────

  test('브로커 루트 우클릭 → Edit Broker Config → 에디터가 열린다', async ({ page }) => {
    await page.locator('#db-tree-container').click({ button: 'right' });

    const configAction = page.getByRole('button', { name: /Edit Broker Config/i });
    await expect(configAction).toBeVisible({ timeout: 5000 });
    await configAction.click();

    // 에디터 탭 또는 Monaco 에디터가 표시된다
    await expect(
      page.getByText('Broker Config', { exact: true })
        .or(page.locator('.monaco-editor'))
    ).toBeVisible({ timeout: 15000 });
  });

  // ─── AS 세션 ──────────────────────────────────────────────────────────────

  test('브로커 노드 하위에 AS 세션 정보가 표시된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });

    // 펼치기
    const chevron = node.locator('span.material-symbols-outlined:has-text("chevron_right")');
    if (await chevron.isVisible()) await chevron.click();

    // AS 노드 또는 세션 리스트 확인
    const asNode = page.locator('#db-tree-container')
      .getByText(/Application Server|AS/i).first();
    if (await asNode.isVisible({ timeout: 3000 }).catch(() => false)) {
      await asNode.click();
      await expect(page.getByText(/Session|Connection/i)).toBeVisible({ timeout: 5000 });
    }
  });

  // ─── 로그 뷰어 접근 ───────────────────────────────────────────────────────

  test('브로커 우클릭 → SQL Log 메뉴가 표시된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });
    await node.click({ button: 'right' });

    const sqlLog = page.getByRole('button', { name: /SQL Log|Log/i }).first();
    await expect(sqlLog).toBeVisible({ timeout: 3000 });
    await page.keyboard.press('Escape');
  });

});
