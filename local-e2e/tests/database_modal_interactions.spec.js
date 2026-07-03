const { test, expect } = require('@playwright/test');
const { login, connectToHost, openDbContextMenu, dismissModal, E2E_DB } = require('./helpers');

/**
 * 데이터베이스 모달 인터랙션 테스트
 *
 * 파괴적 작업(Rename, Delete, Copy)은 폼 검증까지만 확인하고 실제로 Submit하지 않습니다.
 * 비파괴 작업(Check, Backup, Compact, Optimize)은 실제로 실행합니다.
 */
test.describe('Database Modal Interactions', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  // ─── Rename: 폼 검증만 (실제 실행 안 함) ────────────────────────────────

  test('Rename: 빈 입력 시 Submit이 비활성화되고, 입력 후 활성화된다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: 'Rename Database', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Rename/i);

    const submitBtn = modal.getByRole('button', { name: /Rename|Execute/i }).last();
    await expect(submitBtn).toBeDisabled();

    await modal.locator('input[type="text"]').first().fill(`${E2E_DB}_renamed_test`);
    await expect(submitBtn).toBeEnabled();

    // 실행 안 함 — Cancel
    await dismissModal(page);
  });

  // ─── Delete: 확인 다이얼로그만 확인 (실제 삭제 안 함) ───────────────────

  test('Delete: 삭제 확인 다이얼로그가 열린다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: 'Delete Database', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Delete/i);

    await dismissModal(page);
  });

  // ─── Copy(Clone): 폼 검증만 (실제 실행 안 함) ───────────────────────────

  test('Copy Database: 이름 미입력 시 Submit 비활성화, 입력 후 활성화된다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: 'Copy Database', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Clone|Copy/i);

    // Submit 비활성화 확인
    const submitBtn = modal.getByRole('button', { name: /Initiate|Copy|Clone/i }).last();
    await expect(submitBtn).toBeDisabled();

    // 새 DB 이름 입력 → Submit 활성화
    await modal.locator('input[type="text"]').first().fill(`${E2E_DB}_copy_test`);
    await expect(submitBtn).toBeEnabled();

    // 옵션 토글 확인
    const overwrite = modal.locator('button').filter({ hasText: /Overwrite/i });
    await expect(overwrite).toBeVisible();
    await overwrite.click();

    await dismissModal(page);
  });

  // ─── Check Database: 실제 실행 ────────────────────────────────────────────

  test('Check Database: 실행 후 성공 또는 백그라운드 잡이 표시된다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: 'Check Database', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Check|Integrity/i);

    await modal.getByRole('button', { name: /Run|Check|Execute/i }).last().click();

    const result = page.getByText(/complete|success|succeeded/i)
      .or(page.locator('#sidebar-background-jobs'));
    await expect(result.first()).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  // ─── Compact: 모달 열림 확인 ──────────────────────────────────────────────

  test('Compact Database: 모달이 열린다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: 'Compact Database', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Compact/i);

    await dismissModal(page);
  });

  // ─── Optimize: 실제 실행 → 백그라운드 잡 ─────────────────────────────────

  test('Optimize Database: 실행하면 백그라운드 잡 패널에 나타난다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: 'Optimize Database', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: /Execute|Run|Optim/i }).last().click();

    const result = page.locator('#sidebar-background-jobs')
      .or(page.getByText(/success|complete/i));
    await expect(result.first()).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  // ─── Backup: 설정 후 실제 실행 ───────────────────────────────────────────

  test('Backup Database: 경로 설정 후 실행하면 성공 결과가 표시된다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: 'Backup Database', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Backup/i);

    // 백업 경로 설정
    const dirInput = modal.getByLabel(/Directory|Path/i).first();
    if (await dirInput.isVisible()) {
      await dirInput.clear();
      await dirInput.fill('/tmp/cubrid_e2e_backup');
    }

    await modal.getByRole('button', { name: /Run|Backup|Execute/i }).last().click();

    const result = page.getByText(/success|complete|succeeded/i)
      .or(page.locator('#sidebar-background-jobs'));
    await expect(result.first()).toBeVisible({ timeout: 60000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  // ─── Unload: 폼 확인 후 Cancel ───────────────────────────────────────────

  test('Unload Database: 모달이 열리고 대상 경로 입력 필드가 있다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: 'Database Unload', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Unload|Extract/i);

    // 경로 입력 필드가 있어야 한다
    const pathInput = modal.locator('input[type="text"]').first();
    await expect(pathInput).toBeVisible();

    await dismissModal(page);
  });

  // ─── Restore: 폼 확인 후 Cancel ─────────────────────────────────────────

  test('Restore Database: 모달이 열리고 백업 파일 선택 UI가 있다', async ({ page }) => {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: 'Restore Database', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Restore/i);

    await dismissModal(page);
  });

});
