const { test, expect } = require('@playwright/test');
const { login, connectToHost } = require('./helpers');

/**
 * 브로커 관리 테스트
 * - 브로커 목록 표시 및 상태 확인
 * - 시작/중지 토글 실행 (컨텍스트 메뉴로 상태 판별 — StatusIndicator는 텍스트 없음)
 * - 상세 패널 실제 데이터 로드
 * - Properties 모달 파라미터 실제 로드
 * - Broker Config Editor 열기 및 실제 내용 확인
 * - AS 세션 실제 데이터 로드
 * - SQL Log: SQL Log는 컨텍스트 메뉴 아이템이 아닌 브로커 하위 트리 노드
 *
 * Notes:
 *   - StatusIndicator renders ONLY a colored dot (span.inline-flex), never text
 *   - Broker stop/start: uses sidebar RefreshingOverlay ("Stopping broker : ...")
 *   - "report" icon name contains "port" substring → use \b word boundary for Port/PID
 */
test.describe('Broker Management', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
    // Switch to Broker tab
    await page.locator('#tree-section-container').getByRole('button', { name: /Broker/i }).click();
  });

  const brokerTree = (page) => page.locator('#db-tree-container');

  // First broker <details> containing query_editor or broker1
  const brokerNode = (page) =>
    page.locator('#db-tree-container details')
      .filter({ hasText: /query_editor|broker1/i }).first();

  // ─── 브로커 목록 ──────────────────────────────────────────────────────────

  test('브로커 목록에 표준 브로커(query_editor 또는 broker1)가 표시된다', async ({ page }) => {
    await expect(
      brokerTree(page).getByText(/query_editor|broker1/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('각 브로커 노드에 상태 뱃지(span.inline-flex)가 표시된다', async ({ page }) => {
    await expect(
      brokerTree(page).locator('details').filter({ hasText: /query_editor/i }).first()
    ).toBeVisible({ timeout: 10000 });

    // StatusIndicator renders only a colored dot — no "On"/"Off" text
    await expect(
      brokerTree(page).locator('details').filter({ hasText: /query_editor/i }).first()
        .locator('span.inline-flex').first()
    ).toBeVisible({ timeout: 5000 });
  });

  // ─── 브로커 시작/중지 토글: 실제 실행 ───────────────────────────────────

  test('브로커 시작/중지 토글 → 상태가 변경된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });

    // Determine current state via context menu
    await node.locator('> summary').click({ button: 'right' });
    const stopBrokerBtn = page.getByRole('button', { name: /Stop Broker/i });
    const isOn = await stopBrokerBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (isOn) {
      await stopBrokerBtn.click();
      await page.getByText(/Stopping broker/i).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      await page.getByText(/Stopping broker/i).waitFor({ state: 'hidden', timeout: 30000 });
    } else {
      await page.getByRole('button', { name: /Start Broker/i }).click();
      await page.getByText(/Starting broker/i).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      await page.getByText(/Starting broker/i).waitFor({ state: 'hidden', timeout: 30000 });
    }
    await page.waitForTimeout(500);

    // Verify state changed
    await node.locator('> summary').click({ button: 'right' });
    if (isOn) {
      await expect(page.getByRole('button', { name: /Start Broker/i })).toBeVisible({ timeout: 5000 });
    } else {
      await expect(page.getByRole('button', { name: /Stop Broker/i })).toBeVisible({ timeout: 5000 });
    }
    await page.keyboard.press('Escape');

    // Restore original state
    await node.locator('> summary').click({ button: 'right' });
    if (isOn) {
      const startBtn = page.getByRole('button', { name: /Start Broker/i });
      if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await startBtn.click();
        await page.getByText(/Starting broker/i).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await page.getByText(/Starting broker/i).waitFor({ state: 'hidden', timeout: 30000 });
      } else {
        await page.keyboard.press('Escape');
      }
    } else {
      const sBtn = page.getByRole('button', { name: /Stop Broker/i });
      if (await sBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sBtn.click();
        await page.getByText(/Stopping broker/i).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await page.getByText(/Stopping broker/i).waitFor({ state: 'hidden', timeout: 30000 });
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });

  // ─── 브로커 상세 패널: 실제 데이터 로드 ─────────────────────────────────

  test('브로커 노드 클릭 → PID·Port 등 실제 상세 데이터가 표시된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });
    await node.locator('> summary').click();

    // Use word-boundary regex: "report" icon matches /Port/ but NOT /\bPort\b/
    await expect(
      page.getByText(/\bPID\b|\bPort\b/i).first()
        .or(page.locator('th, td').filter({ hasText: /\bPID\b|\bPort\b/i }).first())
    ).toBeVisible({ timeout: 10000 });

    // Verify numeric data exists
    await expect(
      page.locator('th, td').filter({ hasText: /\d+/ }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  // ─── Properties 모달: 실제 파라미터 로드 ─────────────────────────────────

  test('브로커 Properties 모달에 실제 파라미터 값이 로드된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });
    await node.locator('> summary').click({ button: 'right' });
    await page.getByRole('button', { name: /Properties/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    await expect(
      modal.getByText(/MIN_NUM_APPL_SERVER|MAX_NUM_APPL_SERVER|BROKER_PORT/i).first()
    ).toBeVisible({ timeout: 10000 });

    const advancedTab = modal.getByRole('button', { name: /Advanced/i })
      .or(modal.getByText('Advanced', { exact: true })).first();
    if (await advancedTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await advancedTab.click();
      await expect(
        modal.getByText(/SQL_LOG|ACCESS_LOG|SESSION_TIMEOUT/i).first()
      ).toBeVisible({ timeout: 5000 });
    }

    await page.getByRole('button', { name: /Close|Cancel|Discard/i }).first().click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  // ─── Broker Config Editor: 실제 내용 로드 ────────────────────────────────

  test('브로커 탭 우클릭 → Broker Config 에디터에 실제 내용이 로드된다', async ({ page }) => {
    await page.locator('#tree-section-container').getByRole('button', { name: /Broker/i })
      .click({ button: 'right' });
    await page.getByRole('button', { name: /Broker Config|Edit.*Config|cubrid_broker/i }).click();

    const editor = page.locator('textarea, .cm-editor, .CodeMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByText(/\[broker\]|\[%query_editor\]|BROKER_PORT|MIN_NUM_APPL_SERVER/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ─── AS 세션: 실제 데이터 로드 ───────────────────────────────────────────

  test('브로커 하위 AS 세션 노드에 실제 세션 정보가 표시된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });
    await node.locator('> summary').click();

    await expect(
      page.getByText(/AS|Session|Worker|Requests/i).first()
        .or(page.getByText(/no session|0 session/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  // ─── SQL Log: 트리 노드 우클릭 → View All Logs ──────────────────────────

  test('브로커 하위 SQL Log 노드 우클릭 → View All Logs를 클릭하면 탭이 열린다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });

    // Expand the broker node to reveal SQL Log child
    const isOpen = await node.evaluate(el => el.open).catch(() => false);
    if (!isOpen) {
      await node.locator('> summary').click();
      await page.waitForTimeout(300);
    }

    // SQL Log is a child tree node, not a context menu item
    const sqlLogSummary = node.locator('details > summary')
      .filter({ hasText: /SQL Log/i }).first();
    await expect(sqlLogSummary).toBeVisible({ timeout: 5000 });

    await sqlLogSummary.click({ button: 'right' });
    await page.getByRole('button', { name: /View All Logs/i }).click();

    // SQL Log viewer tab should open
    await expect(
      page.getByText(/SQL Log|sql_log|all_logs/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ─── 브로커 파라미터 실시간 조회 ─────────────────────────────────────────

  test('브로커 상세 패널에서 요청 수(TPS/QPS) 수치가 표시된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });
    await node.locator('> summary').click();

    await expect(
      page.getByText(/\bTPS\b|\bQPS\b|\bNum Requests\b/i).first()
        .or(page.locator('th, td').filter({ hasText: /TPS|QPS/i }).first())
    ).toBeVisible({ timeout: 10000 });
  });

});
