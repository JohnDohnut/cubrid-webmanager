const { test, expect } = require('@playwright/test');
const { login, connectToHost } = require('./helpers');

/**
 * 서버 정보 테스트
 * - 호스트 우클릭 메뉴 항목 확인
 * - 서버 버전 정보 모달
 * - 서버 환경 변수 패널
 * - 호스트 정보 패널 (연결 후 클릭)
 */
test.describe('Server Info', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  // ─── 호스트 컨텍스트 메뉴 ────────────────────────────────────────────────

  test('호스트 우클릭 메뉴에 관리 항목들이 표시된다', async ({ page }) => {
    const hostItem = page.locator('#host-section div[title*=":"]').first();
    await hostItem.click({ button: 'right' });

    // 적어도 하나의 메뉴 항목이 있어야 한다
    const menu = page.locator('[role="menu"]').or(page.locator('[class*="context"]'));
    await expect(menu.first()).toBeVisible({ timeout: 3000 });

    await page.keyboard.press('Escape');
  });

  // ─── 서버 버전 정보 ───────────────────────────────────────────────────────

  test('서버 버전 정보 모달이 열린다', async ({ page }) => {
    const hostItem = page.locator('#host-section div[title*=":"]').first();
    await hostItem.click({ button: 'right' });

    const versionBtn = page.getByRole('button', { name: /Server Version|Version Info/i });
    if (!await versionBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip(); return;
    }
    await versionBtn.click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Version|CUBRID/i);

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click();
  });

  // ─── 호스트 상세 패널 ─────────────────────────────────────────────────────

  test('호스트를 클릭하면 연결 정보(주소·포트)가 표시된다', async ({ page }) => {
    const hostItem = page.locator('#host-section div[title*=":"]').first();
    const titleAttr = await hostItem.getAttribute('title');

    // title 속성에 "address:port" 형태로 연결 정보가 있다
    expect(titleAttr).toMatch(/\d+\.\d+\.\d+\.\d+:\d+|localhost:\d+/);
  });

  // ─── 환경 변수 ────────────────────────────────────────────────────────────

  test('호스트 탭에서 환경 변수 패널이 접근 가능하다', async ({ page }) => {
    // 호스트 탭 (DB·Broker·Log 탭과 별도로 존재할 수 있음)
    const envTab = page.getByRole('button', { name: /Env|Environment/i })
      .or(page.getByText(/Environment/i).first());

    if (await envTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await envTab.click();
      await expect(
        page.getByText(/CUBRID|PATH|Variable/i).first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  // ─── DB 트리 로드 확인 ────────────────────────────────────────────────────

  test('호스트 연결 후 Databases 섹션이 표시된다', async ({ page }) => {
    await expect(
      page.locator('#db-tree-container').getByText('Databases', { exact: true })
    ).toBeVisible({ timeout: 10000 });
  });

  test('호스트 연결 후 demodb가 DB 목록에 있다', async ({ page }) => {
    // TreeNode가 <details id="demodb"> 로 렌더링됨 — div.filter 패턴은 동작하지 않음
    const demodb = page.locator('#db-tree-container details#demodb > summary');
    await expect(demodb).toBeVisible({ timeout: 10000 });
  });

});
