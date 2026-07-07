const { test, expect } = require('@playwright/test');
const { login, connectToHost } = require('./helpers');

/**
 * 로그 뷰어 테스트
 *
 * LogTree 구조 (실제 DOM):
 *   - "Broker"    (level-1 <details>, hasChildren=true)
 *   - "Manager"   (level-1 <details>, hasChildren=true)
 *       - "Access log"  (<button>)
 *       - "Error log"   (<button>)
 *   - "Server logs" (level-1 <details>, hasChildren=true)
 *       - "<dbname>"  (<details> per DB)
 *
 * TreeNode summary has icon-text prefix (e.g. "hub Broker", "manage_accounts Manager")
 * → exact: true fails; use locator('summary').filter({ hasText: /X/i }) to target summaries
 */
test.describe('Log Viewer', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);

    // Log 탭으로 전환
    await page.locator('#tree-section-container')
      .getByRole('button', { name: /Log/i }).click();

    // LogTree 가 렌더링될 때까지 "Server logs" summary 대기
    await expect(
      page.locator('#db-tree-container').locator('summary')
        .filter({ hasText: /Server logs/i }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ─── 트리 구조 ───────────────────────────────────────────────────────────

  test('Log 탭으로 전환하면 로그 트리가 표시된다', async ({ page }) => {
    await expect(page.locator('#db-tree-container')).toBeVisible();
    await expect(
      page.locator('#db-tree-container').locator('summary').filter({ hasText: /Broker/i }).first()
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator('#db-tree-container').locator('summary').filter({ hasText: /Manager/i }).first()
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator('#db-tree-container').locator('summary').filter({ hasText: /Server logs/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  // ─── LogViewer 열기 ───────────────────────────────────────────────────────

  test('로그 항목을 클릭하면 LogViewer가 로드된다', async ({ page }) => {
    const managerLabel = page.locator('#db-tree-container').locator('summary')
      .filter({ hasText: /Manager/i }).first();
    await expect(managerLabel).toBeVisible({ timeout: 5000 });
    await managerLabel.click(); // Manager 섹션 펼치기
    await page.waitForTimeout(300);

    const accessLog = page.locator('#db-tree-container').locator('button')
      .filter({ hasText: /Access log/i }).first();
    await expect(accessLog).toBeVisible({ timeout: 5000 });
    await accessLog.dblclick();

    await expect(page.getByPlaceholder(/Search logs/i)).toBeVisible({ timeout: 10000 });
  });

  // ─── 레벨 필터 ────────────────────────────────────────────────────────────

  test('LogViewer에 레벨 필터 드롭다운이 있고 All Levels 옵션이 있다', async ({ page }) => {
    const managerLabel = page.locator('#db-tree-container').locator('summary')
      .filter({ hasText: /Manager/i }).first();
    await managerLabel.click();
    await page.waitForTimeout(300);
    await page.locator('#db-tree-container').locator('button')
      .filter({ hasText: /Access log/i }).first().dblclick();
    await expect(page.getByPlaceholder(/Search logs/i)).toBeVisible({ timeout: 10000 });

    await expect(page.getByText('All Levels')).toBeVisible();
  });

  test('레벨 필터를 Error로 변경하면 필터가 적용된다', async ({ page }) => {
    await page.locator('#db-tree-container').locator('summary')
      .filter({ hasText: /Manager/i }).first().click();
    await page.waitForTimeout(300);
    await page.locator('#db-tree-container').locator('button')
      .filter({ hasText: /Access log/i }).first().dblclick();
    await expect(page.getByPlaceholder(/Search logs/i)).toBeVisible({ timeout: 10000 });

    const select = page.locator('select').first()
      .or(page.getByRole('combobox').first());
    if (await select.isVisible({ timeout: 2000 }).catch(() => false)) {
      await select.selectOption({ label: /Error/i });
      await expect(
        page.getByText('Error').or(page.getByText(/No logs/i))
      ).toBeVisible({ timeout: 5000 });
    }
  });

  // ─── 검색 필터 ────────────────────────────────────────────────────────────

  test('검색어를 입력하면 일치하지 않는 항목이 필터링된다', async ({ page }) => {
    await page.locator('#db-tree-container').locator('summary')
      .filter({ hasText: /Manager/i }).first().click();
    await page.waitForTimeout(300);
    await page.locator('#db-tree-container').locator('button')
      .filter({ hasText: /Access log/i }).first().dblclick();

    const searchInput = page.getByPlaceholder(/Search logs/i);
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    await searchInput.fill('ZZZNOMATCH_UNIQUE_99999');
    await expect(
      page.getByText(/No logs found|no results/i)
        .or(page.locator('[class*="empty"]'))
    ).toBeVisible({ timeout: 5000 });

    await searchInput.clear();
    await expect(
      page.getByText(/No logs found|no results/i)
    ).not.toBeVisible({ timeout: 5000 });
  });

  // ─── 컨텍스트 메뉴 ────────────────────────────────────────────────────────

  test('로그 노드 우클릭 시 컨텍스트 메뉴가 표시된다', async ({ page }) => {
    const serverLogsLabel = page.locator('#db-tree-container').locator('summary')
      .filter({ hasText: /Server logs/i }).first();
    await expect(serverLogsLabel).toBeVisible({ timeout: 5000 });
    await serverLogsLabel.click();
    await page.waitForTimeout(300);

    const dbLogNode = page.locator('#db-tree-container')
      .getByText(process.env.E2E_DB || 'demodb', { exact: true })
      .first();
    if (await dbLogNode.isVisible({ timeout: 5000 }).catch(() => false)) {
      await dbLogNode.click({ button: 'right' });
      const menu = page.locator('[role="menu"]')
        .or(page.locator('[class*="context"]'));
      await expect(menu.first()).toBeVisible({ timeout: 3000 });
      await page.keyboard.press('Escape');
    }
  });

});
