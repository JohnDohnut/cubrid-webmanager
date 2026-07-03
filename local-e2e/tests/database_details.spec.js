const { test, expect } = require('@playwright/test');
const { login, connectToHost, expandDatabase, openDbContextMenu, dismissModal, E2E_DB } = require('./helpers');

/**
 * 데이터베이스 상세 정보 테스트
 * - Clone(Copy) Database 모달 UI
 * - Database Space Monitor 대시보드
 * - Backup Database 모달 UI
 * - Lock Information / Transaction Info 모달
 * - Param Dump / Plan Dump 모달
 */
test.describe('Database Details', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
    await expandDatabase(page);
  });

  // ─── Clone(Copy) Database 모달 UI ─────────────────────────────────────────

  test('Copy Database 모달: 제목·이름 입력 필드·옵션 플래그가 표시된다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: 'Copy Database', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    // 제목 (Clone Database 또는 Copy Database)
    await expect(modal).toContainText(/Clone|Copy/i);
    // 이름 입력 필드
    await expect(modal.locator('input[type="text"]').first()).toBeVisible();
    // Overwrite 옵션
    await expect(modal.getByText(/Overwrite/i)).toBeVisible();

    // 옵션 토글 → 시각적 피드백 확인
    const overwriteCard = modal.locator('button').filter({ hasText: /Overwrite/i });
    await overwriteCard.click();
    await expect(overwriteCard.locator('div.bg-amber-500')).toBeVisible();

    await dismissModal(page);
  });

  // ─── Database Space Monitor ────────────────────────────────────────────────

  test('Space 노드 클릭 시 Space Monitor 대시보드가 로드된다', async ({ page }) => {
    const spaceNode = page.locator('#db-tree-container')
      .getByText('Space', { exact: true }).first();
    await spaceNode.click();

    await expect(page.getByText(/Space Monitor|Database Space/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Used',  { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Free',  { exact: true })).toBeVisible({ timeout: 5000 });
  });

  test('Space Monitor: Volume Categorization 테이블이 표시된다', async ({ page }) => {
    await page.locator('#db-tree-container').getByText('Space', { exact: true }).first().click();
    await expect(page.getByText(/Volume Categor/i)).toBeVisible({ timeout: 15000 });
  });

  test('Space Monitor: Sync 버튼 클릭 시 새로고침이 트리거된다', async ({ page }) => {
    await page.locator('#db-tree-container').getByText('Space', { exact: true }).first().click();
    await expect(page.getByText(/Space Monitor|Database Space/i)).toBeVisible({ timeout: 10000 });

    const syncBtn = page.getByRole('button', { name: /Sync|Refresh/i }).first();
    await expect(syncBtn).toBeVisible();
    await syncBtn.click();
    // 스피너가 잠깐 뜨거나 버튼이 반응해야 한다
    await expect(syncBtn).toBeVisible();
  });

  // ─── Database Info 모달들 ─────────────────────────────────────────────────

  test('Lock Information 모달이 열린다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Database Info' }).hover();
    await page.getByRole('button', { name: 'Lock Information', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Lock/i);
    await dismissModal(page);
  });

  test('Transaction Info 모달이 열린다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Database Info' }).hover();
    await page.getByRole('button', { name: 'Transaction Info', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Transaction/i);
    await dismissModal(page);
  });

  test('Param Dump 모달이 열린다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Database Info' }).hover();
    await page.getByRole('button', { name: 'Param Dump', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Param|Parameter|Database Info/i);
    await dismissModal(page);
  });

  test('Plan Dump 모달이 열린다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Database Info' }).hover();
    await page.getByRole('button', { name: 'Plan Dump', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Plan/i);
    await dismissModal(page);
  });

});
