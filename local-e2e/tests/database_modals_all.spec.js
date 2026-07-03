const { test, expect } = require('@playwright/test');
const { login, connectToHost, expandDatabase, dismissModal, E2E_DB } = require('./helpers');

/**
 * 데이터베이스 전체 모달 실행 테스트
 *
 * 모든 컨텍스트 메뉴 액션을 실제로 실행하고 결과를 확인합니다.
 * 실제 데이터 변경이 없는 조회성 작업은 데이터 로드까지 검증합니다.
 *
 * 단, Rename·Delete·Copy는 database_modal_interactions.spec.js에서 별도 처리합니다.
 */
test.describe('Database All Modals — Full Execution', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  async function openManage(page, action) {
    // TreeNode → <details id="{E2E_DB}"> で렌더링; summary を右クリック
    const dbNode = page.locator(`#db-tree-container details#${E2E_DB} > summary`);
    await expect(dbNode).toBeVisible({ timeout: 10000 });
    await dbNode.click({ button: 'right' });
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: action, exact: true }).click();
    return page.locator('div[role="dialog"]');
  }

  async function openInfo(page, action) {
    const dbNode = page.locator(`#db-tree-container details#${E2E_DB} > summary`);
    await expect(dbNode).toBeVisible({ timeout: 10000 });
    await dbNode.click({ button: 'right' });
    await page.getByRole('button', { name: 'Database Info' }).hover();
    await page.getByRole('button', { name: action, exact: true }).click();
    return page.locator('div[role="dialog"]');
  }

  async function waitForData(page, modal, timeout = 15000) {
    await expect(
      modal.locator('table tbody tr').first()
        .or(modal.getByText(/No data|no result|empty/i).first())
        .or(modal.locator('pre, code, textarea').first())
        .or(modal.getByText(/\d+/).first())
    ).toBeVisible({ timeout });
  }

  // ─── Manage Database: 조회·실행 작업 ──────────────────────────────────────

  test('Database Unload: 실행 후 완료 결과를 확인한다', async ({ page }) => {
    const modal = await openManage(page, 'Database Unload');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Unload|Extract/i);

    const pathInput = modal.locator('input[type="text"]').first();
    await expect(pathInput).toBeVisible();
    await pathInput.fill('/tmp/cubrid_e2e_modals_unload');

    await modal.getByRole('button', { name: /Run|Unload|Execute/i }).last().click();
    await expect(
      page.getByText(/success|complete|succeeded/i)
        .or(page.locator('#sidebar-background-jobs'))
    ).toBeVisible({ timeout: 120000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  test('Check Database: 실행 후 완료 결과를 확인한다', async ({ page }) => {
    const modal = await openManage(page, 'Check Database');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Check/i);

    await modal.getByRole('button', { name: /Run|Check|Execute/i }).last().click();
    await expect(
      page.getByText(/success|complete|succeeded/i)
        .or(page.locator('#sidebar-background-jobs'))
    ).toBeVisible({ timeout: 60000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  test('Compact Database: 실행 후 완료 결과를 확인한다', async ({ page }) => {
    const modal = await openManage(page, 'Compact Database');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Compact/i);

    await modal.getByRole('button', { name: /Run|Compact|Execute/i }).last().click();
    await expect(
      page.getByText(/success|complete|succeeded/i)
        .or(page.locator('#sidebar-background-jobs'))
    ).toBeVisible({ timeout: 60000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  test('Optimize Database: 실행 후 완료 결과를 확인한다', async ({ page }) => {
    const modal = await openManage(page, 'Optimize Database');
    await expect(modal).toBeVisible();

    await modal.getByRole('button', { name: /Run|Execute|Optim/i }).last().click();
    await expect(
      page.getByText(/success|complete|succeeded/i)
        .or(page.locator('#sidebar-background-jobs'))
    ).toBeVisible({ timeout: 60000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  test('Backup Database: 실행 후 완료 결과를 확인한다', async ({ page }) => {
    const modal = await openManage(page, 'Backup Database');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Backup/i);

    const dirInput = modal.getByLabel(/Directory|Path/i).first();
    if (await dirInput.isVisible()) {
      await dirInput.clear();
      await dirInput.fill('/tmp/cubrid_e2e_modals_backup');
    }

    await modal.getByRole('button', { name: /Run|Backup|Execute/i }).last().click();
    await expect(
      page.getByText(/success|complete|succeeded/i)
        .or(page.locator('#sidebar-background-jobs'))
    ).toBeVisible({ timeout: 120000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  test('Restore Database: Backup 경로로 실행 후 완료를 확인한다', async ({ page }) => {
    const modal = await openManage(page, 'Restore Database');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Restore/i);

    const pathInput = modal.locator('input[type="text"]').first();
    if (await pathInput.isVisible()) {
      await pathInput.fill('/tmp/cubrid_e2e_modals_backup');
    }

    await modal.getByRole('button', { name: /Restore|Execute|Run/i }).last().click();
    await expect(
      page.getByText(/success|complete|succeeded/i)
        .or(page.locator('#sidebar-background-jobs'))
    ).toBeVisible({ timeout: 120000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  test('Rename Database: 폼 유효성 검증 (Submit 안 함)', async ({ page }) => {
    const modal = await openManage(page, 'Rename Database');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Rename/i);

    const submitBtn = modal.getByRole('button', { name: /Rename|Execute/i }).last();
    await expect(submitBtn).toBeDisabled();
    await modal.locator('input[type="text"]').first().fill(`${E2E_DB}_test`);
    await expect(submitBtn).toBeEnabled();

    await dismissModal(page);
  });

  test('Delete Database: 삭제 확인 다이얼로그 열림 (Submit 안 함)', async ({ page }) => {
    const modal = await openManage(page, 'Delete Database');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Delete/i);
    await dismissModal(page);
  });

  // ─── Database Info: 실제 데이터 로드 ─────────────────────────────────────

  test('Lock Information: 실행 후 실제 데이터가 로드된다', async ({ page }) => {
    const modal = await openInfo(page, 'Lock Information');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Lock/i);
    await waitForData(page, modal);
    await dismissModal(page);
  });

  test('Transaction Info: 실행 후 실제 데이터가 로드된다', async ({ page }) => {
    const modal = await openInfo(page, 'Transaction Info');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Transaction/i);
    await waitForData(page, modal);
    await dismissModal(page);
  });

  test('Param Dump: 실행 후 CUBRID 파라미터가 로드된다', async ({ page }) => {
    const modal = await openInfo(page, 'Param Dump');
    await expect(modal).toBeVisible();

    await expect(
      modal.getByText(/lock_timeout|max_clients|data_buffer/i).first()
        .or(modal.locator('table tbody tr').first())
        .or(modal.locator('pre, code').first())
    ).toBeVisible({ timeout: 15000 });

    await dismissModal(page);
  });

  test('Plan Dump: 실행 후 계획 캐시 데이터 또는 빈 상태가 로드된다', async ({ page }) => {
    const modal = await openInfo(page, 'Plan Dump');
    await expect(modal).toBeVisible();
    await waitForData(page, modal);
    await dismissModal(page);
  });

  // ─── 직접 액션 ────────────────────────────────────────────────────────────

  test('Properties 모달에 실제 DB 상세 정보가 로드된다', async ({ page }) => {
    const dbNode = page.locator(`#db-tree-container details#${E2E_DB} > summary`);
    await expect(dbNode).toBeVisible({ timeout: 10000 });
    await dbNode.click({ button: 'right' });
    await page.getByRole('button', { name: 'Properties', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Properties/i);

    // 실제 DB 정보 (경로, 크기 등)
    await expect(
      modal.getByText(/Path|Location|Size|Volume|Page/i).first()
    ).toBeVisible({ timeout: 10000 });

    await dismissModal(page);
  });

  // ─── Job Automation 모달 ──────────────────────────────────────────────────

  test('Add Backup Plan 모달에 입력 필드가 있다', async ({ page }) => {
    await expandDatabase(page);

    const backupFolder = page.locator('#db-tree-container')
      .getByText('Backup Plan', { exact: true });
    await expect(backupFolder).toBeVisible({ timeout: 5000 });
    await backupFolder.click({ button: 'right' });
    await page.getByRole('button', { name: 'Add Backup Plan' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('input[type="text"]').first()).toBeVisible();

    await dismissModal(page);
  });

  test('Auto Backup Log에 로그 내용 또는 빈 상태가 로드된다', async ({ page }) => {
    await expandDatabase(page);

    const backupFolder = page.locator('#db-tree-container')
      .getByText('Backup Plan', { exact: true });
    await expect(backupFolder).toBeVisible({ timeout: 5000 });
    await backupFolder.click({ button: 'right' });
    await page.getByRole('button', { name: 'Auto Backup Log' }).click();

    await expect(page.getByText(/Auto Backup Log/i)).toBeVisible({ timeout: 10000 });

    // 로그 데이터 또는 빈 상태
    await expect(
      page.locator('table tbody tr').first()
        .or(page.getByText(/No log|no data|empty/i).first())
        .or(page.locator('div[role="dialog"] pre, div[role="dialog"] code').first())
    ).toBeVisible({ timeout: 15000 });

    await dismissModal(page);
  });

  test('Add Query Plan 모달에 입력 필드가 있다', async ({ page }) => {
    await expandDatabase(page);

    const queryFolder = page.locator('#db-tree-container')
      .getByText('Query Plan', { exact: true });
    await expect(queryFolder).toBeVisible({ timeout: 5000 });
    await queryFolder.click({ button: 'right' });
    await page.getByRole('button', { name: 'Add Query Plan' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('input[type="text"], textarea').first()).toBeVisible();

    await dismissModal(page);
  });

  // ─── Space 모달 ───────────────────────────────────────────────────────────

  test('Add Volume 모달에 타입 선택 및 경로 입력 필드가 있다', async ({ page }) => {
    await expandDatabase(page);

    const spaceFolder = page.locator('#db-tree-container')
      .getByText('Space', { exact: true });
    await expect(spaceFolder).toBeVisible({ timeout: 5000 });
    await spaceFolder.click({ button: 'right' });
    await page.getByRole('button', { name: 'Add Volume' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('input[type="text"]').first()).toBeVisible();

    await dismissModal(page);
  });

  test('Set Automation Volume 모달에 크기 입력 필드가 있다', async ({ page }) => {
    await expandDatabase(page);

    const spaceFolder = page.locator('#db-tree-container')
      .getByText('Space', { exact: true });
    await expect(spaceFolder).toBeVisible({ timeout: 5000 });
    await spaceFolder.click({ button: 'right' });
    await page.getByRole('button', { name: 'Set Automation Volume' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(
      modal.locator('input[type="number"], input[type="text"]').first()
    ).toBeVisible();

    await dismissModal(page);
  });

});
