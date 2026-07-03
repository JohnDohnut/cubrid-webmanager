const { test, expect } = require('@playwright/test');
const { login, connectToHost, openDbContextMenu, dismissModal, E2E_DB } = require('./helpers');

/**
 * 데이터베이스 라이프사이클 테스트
 * - 데이터베이스 시작/중지 토글
 * - 데이터베이스 상태 표시 확인
 * - 데이터베이스 생성 모달 열기
 * - 데이터베이스 속성 모달 열기
 */
test.describe('Database Lifecycle', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  // ─── 상태 표시 ────────────────────────────────────────────────────────────

  test('DB 목록에서 각 데이터베이스의 On/Off 상태가 표시된다', async ({ page }) => {
    const dbTree = page.locator('#db-tree-container');
    await expect(dbTree).toBeVisible();

    // 상태 뱃지(On/Off)가 하나 이상 있어야 한다
    const statusBadge = dbTree.locator('span.inline-flex').first();
    await expect(statusBadge).toBeVisible({ timeout: 10000 });
  });

  // ─── 시작/중지 토글 ───────────────────────────────────────────────────────

  test('demodb 시작/중지를 토글하면 상태가 바뀐다', async ({ page }) => {
    const dbNode = page.locator('#db-tree-container')
      .locator('div').filter({ hasText: new RegExp(`^${E2E_DB}$`) }).first();
    await expect(dbNode).toBeVisible({ timeout: 10000 });

    const badge       = dbNode.locator('span.inline-flex');
    const statusText  = await badge.innerText();
    const isStarted   = statusText.includes('On');

    await dbNode.click({ button: 'right' });
    const action = isStarted ? /Stop Database/i : /Start Database/i;
    await page.getByRole('button', { name: action }).click();

    const expected = isStarted ? 'Off' : 'On';
    await expect(badge).toContainText(expected, { timeout: 20000 });
  });

  // ─── 생성 모달 ────────────────────────────────────────────────────────────

  test('DB 트리 루트 우클릭으로 Create Database 모달이 열린다', async ({ page }) => {
    await page.locator('#db-tree-container').click({ button: 'right' });
    await page.getByRole('button', { name: /Create Database/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Create Database|New database/i);

    await dismissModal(page);
  });

  // ─── 속성 모달 ────────────────────────────────────────────────────────────

  test('demodb 우클릭 → Properties 모달이 열린다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: /Properties/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Database Properties|Properties/i);

    await dismissModal(page);
  });

});
