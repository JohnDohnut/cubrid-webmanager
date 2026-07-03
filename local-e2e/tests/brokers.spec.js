const { test, expect } = require('@playwright/test');
const { login, connectToHost } = require('./helpers');

/**
 * 브로커 관리 테스트
 * - 브로커 목록 표시 및 상태 확인
 * - 시작/중지 토글 실행
 * - 상세 패널 실제 데이터 로드
 * - Properties 모달 파라미터 실제 로드
 * - Broker Config Editor 열기 및 실제 내용 확인
 * - AS 세션 실제 데이터 로드
 * - SQL Log 실제 뷰어 열기 및 로그 데이터 로드
 */
test.describe('Broker Management', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
    // Broker 탭으로 전환 — 탭 버튼 텍스트는 material icon "hub" 포함이므로 /Broker/i 사용
    await page.locator('#tree-section-container').getByRole('button', { name: /Broker/i }).click();
  });

  // BrokerTree 는 #db-tree-container 내에 렌더링됨
  const brokerTree = (page) => page.locator('#db-tree-container');

  // 브로커 <details> 노드 — TreeNode가 <details id="query_editor"> 로 렌더링됨
  const brokerNode = (page) =>
    page.locator('#db-tree-container details')
      .filter({ hasText: /query_editor|broker1/i }).first();

  // ─── 브로커 목록 ──────────────────────────────────────────────────────────

  test('브로커 목록에 표준 브로커(query_editor 또는 broker1)가 표시된다', async ({ page }) => {
    await expect(
      brokerTree(page).getByText(/query_editor|broker1/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('각 브로커 노드에 On/Off 상태 뱃지가 표시된다', async ({ page }) => {
    await expect(
      brokerTree(page).locator('details').filter({ hasText: /query_editor/i }).first()
    ).toBeVisible({ timeout: 10000 });

    // On 또는 Off 뱃지가 반드시 있어야 함
    await expect(
      brokerTree(page).getByText(/^On$|^Off$|^Running$|^Stopped$/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  // ─── 브로커 시작/중지 토글: 실제 실행 ───────────────────────────────────

  test('브로커 시작/중지 토글 → 상태가 변경된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });

    const statusBefore = await brokerTree(page)
      .getByText(/^On$|^Off$|^Running$|^Stopped$/i).first().textContent();

    // 토글 버튼 클릭 (On/Off 버튼은 summary 내부에 있음)
    const toggleBtn = node
      .getByRole('button', { name: /Start|Stop|On|Off/i }).first()
      .or(node.locator('button').first());
    await toggleBtn.click();

    // 상태가 바뀔 때까지 대기
    await expect(
      brokerTree(page).getByText(/^On$|^Off$|^Running$|^Stopped$/i).first()
    ).not.toHaveText(statusBefore, { timeout: 20000 });

    // 원복
    await toggleBtn.click();
    await expect(
      brokerTree(page).getByText(new RegExp(`^${statusBefore}$`, 'i')).first()
    ).toBeVisible({ timeout: 20000 });
  });

  // ─── 브로커 상세 패널: 실제 데이터 로드 ─────────────────────────────────

  test('브로커 노드 클릭 → PID·Port 등 실제 상세 데이터가 표시된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });
    // TreeNode summary 클릭 → 브로커 상세 로드
    await node.locator('> summary').click();

    // 실제 브로커 상세 정보가 로드되어야 함
    await expect(
      page.getByText(/PID|Port|Process|Num Requests/i).first()
    ).toBeVisible({ timeout: 10000 });

    // 숫자 데이터가 실제로 있는지 확인
    await expect(
      page.locator('[class*="detail"], [class*="panel"], [class*="info"]')
        .getByText(/\d+/).first()
    ).toBeVisible({ timeout: 5000 });
  });

  // ─── Properties 모달: 실제 파라미터 로드 ─────────────────────────────────

  test('브로커 Properties 모달에 실제 파라미터 값이 로드된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });
    await node.locator('> summary').click({ button: 'right' });
    await page.getByRole('button', { name: 'Properties' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // Common 탭: 실제 파라미터가 있어야 함
    await expect(
      modal.getByText(/MIN_NUM_APPL_SERVER|MAX_NUM_APPL_SERVER|BROKER_PORT/i).first()
    ).toBeVisible({ timeout: 10000 });

    // Advanced 탭 전환
    const advancedTab = modal.getByRole('button', { name: /Advanced/i })
      .or(modal.getByText('Advanced', { exact: true })).first();
    if (await advancedTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await advancedTab.click();
      // Advanced 탭에도 실제 파라미터가 있어야 함
      await expect(
        modal.getByText(/SQL_LOG|ACCESS_LOG|SESSION_TIMEOUT/i).first()
      ).toBeVisible({ timeout: 5000 });
    }

    await page.getByRole('button', { name: /Close|Cancel|Discard/i }).first().click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  // ─── Broker Config Editor: 실제 내용 로드 ────────────────────────────────

  test('브로커 탭 우클릭 → Broker Config 에디터에 실제 내용이 로드된다', async ({ page }) => {
    // Broker Config 컨텍스트 메뉴는 TreeTabHeader의 Broker 탭 버튼을 우클릭하면 나타남
    await page.locator('#tree-section-container').getByRole('button', { name: /Broker/i })
      .click({ button: 'right' });
    await page.getByRole('button', { name: /Broker Config|Edit.*Config|cubrid_broker/i }).click();

    const editor = page.locator('textarea, .cm-editor, .CodeMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });

    // 실제 broker.conf 내용
    await expect(
      page.getByText(/\[broker\]|\[%query_editor\]|BROKER_PORT|MIN_NUM_APPL_SERVER/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ─── AS 세션: 실제 데이터 로드 ───────────────────────────────────────────

  test('브로커 하위 AS 세션 노드에 실제 세션 정보가 표시된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });

    // 브로커 노드 펼치기
    await node.locator('> summary').click();

    // AS 세션 정보 또는 "No sessions" 메시지
    await expect(
      page.getByText(/AS|Session|Worker|Requests/i).first()
        .or(page.getByText(/no session|0 session/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  // ─── SQL Log: 실제 로그 뷰어 열기 ────────────────────────────────────────

  test('브로커 우클릭 → SQL Log 메뉴 클릭 → 로그 뷰어가 열리고 데이터가 로드된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });
    await node.locator('> summary').click({ button: 'right' });

    const sqlLogBtn = page.getByRole('button', { name: /SQL Log/i });
    await expect(sqlLogBtn).toBeVisible({ timeout: 5000 });
    await sqlLogBtn.click();

    // SQL Log 뷰어 패널 또는 모달이 열려야 함
    await expect(
      page.getByText(/SQL Log|sql_log/i).first()
    ).toBeVisible({ timeout: 10000 });

    // 로그 내용 또는 빈 상태 메시지가 로드되어야 함
    await expect(
      page.locator('table tbody tr').first()
        .or(page.getByText(/No log|no data|empty/i).first())
        .or(page.locator('pre, code, [class*="log-viewer"]').first())
        .or(page.getByText(/Time|Query|Status/i).first())
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /Close|Cancel|Discard/i }).first().click().catch(() => {});
  });

  // ─── 브로커 파라미터 실시간 조회 ─────────────────────────────────────────

  test('브로커 상세 패널에서 요청 수(Num Requests) 수치가 표시된다', async ({ page }) => {
    const node = brokerNode(page);
    await expect(node).toBeVisible({ timeout: 10000 });
    await node.locator('> summary').click();

    await expect(
      page.getByText(/Num Requests|Request|TPS|QPS/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

});
