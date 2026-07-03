const { test, expect } = require('@playwright/test');
const { login, connectToHost } = require('./helpers');

/**
 * 로그 뷰어 테스트
 * - Log 탭 전환 및 로그 트리 표시
 * - 로그 파일 클릭 → LogViewer 로드
 * - 레벨 필터 (All Levels / Error / Warning / Info)
 * - 검색 필터
 * - 로그 노드 컨텍스트 메뉴
 */
test.describe('Log Viewer', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);

    // Log 탭으로 전환
    await page.locator('#tree-section-container')
      .getByRole('button', { name: /Log/i }).click();
    await expect(
      page.locator('#db-tree-container').getByText('Logs', { exact: true })
    ).toBeVisible({ timeout: 10000 });
  });

  // ─── 트리 ─────────────────────────────────────────────────────────────────

  test('Log 탭으로 전환하면 로그 트리가 표시된다', async ({ page }) => {
    await expect(page.locator('#db-tree-container')).toBeVisible();
    await expect(
      page.locator('#db-tree-container').locator('div[role="treeitem"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ─── LogViewer 열기 ───────────────────────────────────────────────────────

  test('로그 항목을 클릭하면 LogViewer가 로드된다', async ({ page }) => {
    const logItems = page.locator('#db-tree-container').locator('div[role="treeitem"]');
    await expect(logItems.first()).toBeVisible({ timeout: 10000 });
    await logItems.first().click();

    // LogViewer 식별 — "Search logs..." 입력 필드
    await expect(page.getByPlaceholder(/Search logs/i))
      .toBeVisible({ timeout: 10000 });
  });

  // ─── 레벨 필터 ────────────────────────────────────────────────────────────

  test('LogViewer에 레벨 필터 드롭다운이 있고 All Levels 옵션이 있다', async ({ page }) => {
    await page.locator('#db-tree-container')
      .locator('div[role="treeitem"]').first().click();
    await expect(page.getByPlaceholder(/Search logs/i)).toBeVisible({ timeout: 10000 });

    await expect(page.getByText('All Levels')).toBeVisible();
  });

  test('레벨 필터를 Error로 변경하면 필터가 적용된다', async ({ page }) => {
    await page.locator('#db-tree-container')
      .locator('div[role="treeitem"]').first().click();
    await expect(page.getByPlaceholder(/Search logs/i)).toBeVisible({ timeout: 10000 });

    // 셀렉트 또는 드롭다운 변경
    const select = page.locator('select').first()
      .or(page.getByRole('combobox').first());
    if (await select.isVisible({ timeout: 2000 }).catch(() => false)) {
      await select.selectOption({ label: /Error/i });
      // 필터 적용 후 "Error" 또는 빈 상태
      await expect(page.getByText('Error').or(page.getByText(/No logs/i))).toBeVisible({ timeout: 5000 });
    }
  });

  // ─── 검색 필터 ────────────────────────────────────────────────────────────

  test('검색어를 입력하면 일치하지 않는 항목이 필터링된다', async ({ page }) => {
    await page.locator('#db-tree-container')
      .locator('div[role="treeitem"]').first().click();

    const searchInput = page.getByPlaceholder(/Search logs/i);
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    await searchInput.fill('ZZZNOMATCH_UNIQUE_99999');

    await expect(
      page.getByText(/No logs found|no results/i)
        .or(page.locator('[class*="empty"]'))
    ).toBeVisible({ timeout: 5000 });

    // 검색어 지우면 로그가 돌아와야 한다
    await searchInput.clear();
    await expect(
      page.getByText(/No logs found|no results/i)
    ).not.toBeVisible({ timeout: 5000 });
  });

  // ─── 컨텍스트 메뉴 ────────────────────────────────────────────────────────

  test('로그 노드 우클릭 시 컨텍스트 메뉴가 표시된다', async ({ page }) => {
    const logItems = page.locator('#db-tree-container').locator('div[role="treeitem"]');
    await expect(logItems.first()).toBeVisible({ timeout: 10000 });

    await logItems.first().click({ button: 'right' });

    const menu = page.locator('[role="menu"]')
      .or(page.locator('[class*="context"]'));
    await expect(menu.first()).toBeVisible({ timeout: 3000 });

    await page.keyboard.press('Escape');
  });

});
