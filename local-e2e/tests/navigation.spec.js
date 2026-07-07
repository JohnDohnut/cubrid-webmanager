const { test, expect } = require('@playwright/test');
const { login, connectToHost } = require('./helpers');

/**
 * 사이드바 네비게이션 테스트
 * - 호스트 목록 표시
 * - DB 트리 확장/탐색
 * - DB·Broker·Log 탭 전환
 * - 다크/라이트 모드 토글
 *
 * Note: multiple DBs in tree → scope child node checks to details#demodb
 * Note: Log tree summaries have icon-text prefix → use .filter({ hasText: /X/i })
 */
test.describe('Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ─── 호스트 목록 ──────────────────────────────────────────────────────────

  test('로그인 후 호스트 목록 또는 호스트 추가 안내가 표시된다', async ({ page }) => {
    const hostList = page.locator('#host-section');
    await expect(hostList).toBeVisible();

    await page.waitForSelector('#host-section details, #host-section button', { timeout: 15000 });

    const hasHosts = await page.locator('#host-section details').count() > 0;
    if (hasHosts) {
      await expect(page.locator('#host-section details').first()).toBeVisible();
    } else {
      await expect(page.getByRole('button', { name: /Add|first host/i })).toBeVisible();
    }
  });

  test('호스트를 클릭하면 DB 트리가 표시된다', async ({ page }) => {
    await connectToHost(page);
    await expect(page.locator('#tree-section-container')).toBeVisible();
  });

  // ─── DB 트리 탐색 ─────────────────────────────────────────────────────────

  test('demodb 노드를 펼치면 하위 폴더가 나타난다', async ({ page }) => {
    await connectToHost(page);

    const dbDetails = page.locator('#db-tree-container details#demodb');
    const dbSummary = dbDetails.locator('> summary');

    if (await dbSummary.isVisible({ timeout: 5000 }).catch(() => false)) {
      const isOpen = await dbDetails.evaluate(el => el.open);
      if (!isOpen) await dbSummary.click();
      await page.waitForTimeout(300);

      // Scope child node checks to details#demodb to avoid strict mode with multiple DBs
      await expect(dbDetails.locator('[id="Users"] > summary')).toBeVisible({ timeout: 5000 });
      await expect(dbDetails.locator('[id="Space"] > summary')).toBeVisible({ timeout: 5000 });
      await expect(
        dbDetails.locator('[id="Job automation"] > summary')
          .or(dbDetails.locator('[id="Backup Plan"] > summary'))
      ).toBeVisible({ timeout: 5000 });
    }
  });

  // ─── 탭 전환 ──────────────────────────────────────────────────────────────

  test('DB·Broker·Log 탭을 순서대로 전환하면 각 트리가 표시된다', async ({ page }) => {
    await connectToHost(page);

    const treeSection  = page.locator('#tree-section-container');
    const brokerTab    = treeSection.getByRole('button', { name: /Broker/i });
    const logTab       = treeSection.getByRole('button', { name: /Log/i });
    const dbTab        = treeSection.getByRole('button', { name: /Database/i });

    // Broker 탭
    await brokerTab.click();
    await expect(
      page.locator('#db-tree-container > div').nth(1)
    ).toBeVisible({ timeout: 5000 });

    // Log 탭 — Log tree summaries have icon-text prefix → filter by hasText
    await logTab.click();
    await expect(
      page.locator('#db-tree-container').locator('summary').filter({ hasText: /Broker/i }).first()
    ).toBeVisible({ timeout: 5000 });

    // DB 탭으로 복귀
    await dbTab.click();
    await expect(page.locator('#db-tree-container > div').first())
      .toBeVisible({ timeout: 5000 });
  });

  // ─── 다크/라이트 모드 ─────────────────────────────────────────────────────

  test('다크/라이트 모드 토글 버튼이 동작한다', async ({ page }) => {
    const toggle = page.locator('button:has-text("dark_mode"), button:has-text("light_mode")').first();
    await expect(toggle).toBeVisible({ timeout: 5000 });

    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    await toggle.click();

    const isNowDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isNowDark).not.toBe(isDark);
  });

});
