const { test, expect } = require('@playwright/test');
const { login, connectToHost, expandDatabase, openDbContextMenu, dismissModal, E2E_DB } = require('./helpers');

/**
 * 데이터베이스 상세 정보 테스트
 * - Copy DB 모달 UI 필드 검증
 * - Space Monitor 실행 및 실제 데이터 로드
 * - Lock Info / Transaction Info / Param Dump / Plan Dump 실제 실행 후 데이터 확인
 */
test.describe('Database Details', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  // ─── Copy Database 모달 UI ────────────────────────────────────────────────

  test('Copy Database 모달: 제목·이름 입력 필드·옵션 플래그가 표시된다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: /Copy Database/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Clone|Copy/i);

    await expect(modal.locator('input[type="text"]').first()).toBeVisible();
    await expect(modal.locator('button').filter({ hasText: /Overwrite/i })).toBeVisible();

    await dismissModal(page);
  });

  // ─── Space Monitor ────────────────────────────────────────────────────────

  test('Space 노드 클릭 시 Space Monitor 대시보드가 로드된다', async ({ page }) => {
    await expandDatabase(page);
    // Space span is clipped — click the <details id="Space"> summary directly
    await page.locator(`#db-tree-container details#${E2E_DB} [id="Space"] > summary`).click();
    await expect(page.getByText(/Space Monitor|Database Space/i)).toBeVisible({ timeout: 10000 });
  });

  test('Space Monitor: Volume Categorization 테이블에 실제 데이터 행이 있다', async ({ page }) => {
    await expandDatabase(page);
    await page.locator(`#db-tree-container details#${E2E_DB} [id="Space"] > summary`).click();
    await expect(page.getByText(/Volume Categor/i)).toBeVisible({ timeout: 15000 });

    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Space Monitor: Sync 버튼 클릭 후 데이터가 다시 로드된다', async ({ page }) => {
    await expandDatabase(page);
    await page.locator(`#db-tree-container details#${E2E_DB} [id="Space"] > summary`).click();
    await expect(page.getByText(/Space Monitor|Database Space/i)).toBeVisible({ timeout: 10000 });

    const syncBtn = page.getByRole('button', { name: /Sync|Refresh/i }).first();
    await expect(syncBtn).toBeVisible();
    await syncBtn.click();
    await expect(page.getByText(/Volume Categor/i)).toBeVisible({ timeout: 15000 });
  });

  // ─── Lock Information: 실제 실행 ─────────────────────────────────────────

  test('Lock Information: 실행 후 잠금 데이터 또는 No Locks 메시지가 로드된다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Database Info' }).hover();
    await page.getByRole('button', { name: /Lock Information/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Lock/i);

    await expect(
      modal.locator('table tbody tr').first()
        .or(modal.getByText(/No lock|no data|empty/i).first())
        .or(modal.getByText(/Transaction|Object|Mode/i).first())
    ).toBeVisible({ timeout: 15000 });

    await dismissModal(page);
  });

  // ─── Transaction Info: 실제 실행 ─────────────────────────────────────────

  test('Transaction Info: 실행 후 트랜잭션 데이터가 로드된다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Database Info' }).hover();
    await page.getByRole('button', { name: /Transaction Info/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Transaction/i);

    await expect(
      modal.locator('table tbody tr').first()
        .or(modal.getByText(/No transaction|no data|empty/i).first())
        .or(modal.getByText(/User|Process|Query/i).first())
    ).toBeVisible({ timeout: 15000 });

    await dismissModal(page);
  });

  // ─── Param Dump: 실제 실행 ────────────────────────────────────────────────

  test('Param Dump: 실행 후 CUBRID 파라미터 값이 로드된다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Database Info' }).hover();
    await page.getByRole('button', { name: /Param Dump/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Param|Database Info/i);

    await expect(
      modal.locator('table tbody tr').first()
        .or(modal.getByText(/lock_timeout|max_clients|data_buffer|page_buffer/i).first())
        .or(modal.locator('pre, code, textarea').first())
    ).toBeVisible({ timeout: 15000 });

    await dismissModal(page);
  });

  // ─── Plan Dump: 실제 실행 ────────────────────────────────────────────────

  test('Plan Dump: 실행 후 실행 계획 캐시 데이터가 로드된다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Database Info' }).hover();
    await page.getByRole('button', { name: /Plan Dump/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Plan/i);

    await expect(
      modal.locator('table tbody tr').first()
        .or(modal.getByText(/No plan|no data|empty/i).first())
        .or(modal.locator('pre, code, textarea').first())
        .or(modal.getByText(/Query|Cache/i).nth(1))
    ).toBeVisible({ timeout: 15000 });

    await dismissModal(page);
  });

});
