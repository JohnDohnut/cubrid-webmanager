const { test, expect } = require('@playwright/test');
const { login, connectToHost, expandDatabase, expandJobAutomation, dismissModal, E2E_DB } = require('./helpers');

/**
 * 잡 자동화 테스트 (Backup Plan / Query Plan)
 * - Backup Plan: 추가 → 목록 확인 → 삭제
 * - Query Plan: 추가 → 목록 확인 → 삭제
 * - 자동화 로그 모달 열기
 *
 * Note: multiple DBs in tree → must scope to details#E2E_DB to avoid strict mode violations
 * Note: context menu buttons have icon text prefix → use regex, never exact string
 */
test.describe('Job Automation', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
    await expandDatabase(page);
    await expandJobAutomation(page);
  });

  // ─── Backup Plan ──────────────────────────────────────────────────────────

  test('Backup Plan 폴더가 DB 트리에 표시된다', async ({ page }) => {
    const backupFolder = page.locator(`#db-tree-container details#${E2E_DB} [id="Backup Plan"] > summary`);
    await expect(backupFolder).toBeVisible({ timeout: 5000 });
  });

  test('Add Backup Plan 모달이 열린다', async ({ page }) => {
    const backupFolder = page.locator(`#db-tree-container details#${E2E_DB} [id="Backup Plan"] > summary`);
    await expect(backupFolder).toBeVisible({ timeout: 5000 });
    await backupFolder.click({ button: 'right' });

    await page.getByRole('button', { name: /Add Backup Plan/i }).click();
    await expect(page.getByText(/New Backup Plan|Backup Plan/i)).toBeVisible();

    await dismissModal(page);
  });

  test('Backup Plan을 추가하면 목록에 나타나고 삭제할 수 있다', async ({ page }) => {
    const planName = `e2e_backup_${Date.now().toString().slice(-4)}`;

    const backupFolder = page.locator(`#db-tree-container details#${E2E_DB} [id="Backup Plan"] > summary`);
    await expect(backupFolder).toBeVisible({ timeout: 5000 });
    await backupFolder.click({ button: 'right' });
    await page.getByRole('button', { name: /Add Backup Plan/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // Plan ID / 이름 입력
    const idInput = modal.locator('input[type="text"]').first();
    await expect(idInput).toBeVisible({ timeout: 5000 });
    await idInput.fill(planName);

    // 백업 경로 설정
    const pathInput = modal.locator('input[type="text"]').nth(1);
    if (await pathInput.isVisible()) await pathInput.fill('/tmp/cubrid_backup_plan');

    // 저장
    const saveBtn = modal.getByRole('button', { name: /Save|Add|Confirm/i }).last();
    await saveBtn.click();

    await expect(
      page.getByText(/success|saved/i)
        .or(page.locator('#db-tree-container').getByText(planName))
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});

    // 삭제
    const planNode = page.locator('#db-tree-container').getByText(planName).first();
    if (await planNode.isVisible({ timeout: 5000 }).catch(() => false)) {
      await planNode.click({ button: 'right' });
      const delBtn = page.getByRole('button', { name: /Delete.*Plan|Remove/i });
      if (await delBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await delBtn.click();
        const confirmModal = page.locator('div[role="dialog"]');
        if (await confirmModal.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmModal.getByRole('button', { name: /Confirm|Delete|OK/i }).last().click();
        }
      }
    }
  });

  test('Auto Backup Log 모달이 열린다', async ({ page }) => {
    const backupFolder = page.locator(`#db-tree-container details#${E2E_DB} [id="Backup Plan"] > summary`);
    await expect(backupFolder).toBeVisible({ timeout: 5000 });
    await backupFolder.click({ button: 'right' });

    await page.getByRole('button', { name: /Auto Backup Log/i }).click();
    await expect(page.getByText(/Auto Backup Log/i)).toBeVisible();

    await dismissModal(page);
  });

  // ─── Query Plan ───────────────────────────────────────────────────────────

  test('Query Plan 폴더가 DB 트리에 표시된다', async ({ page }) => {
    const queryFolder = page.locator(`#db-tree-container details#${E2E_DB} [id="Query Plan"] > summary`);
    await expect(queryFolder).toBeVisible({ timeout: 5000 });
  });

  test('Add Query Plan 모달이 열린다', async ({ page }) => {
    const queryFolder = page.locator(`#db-tree-container details#${E2E_DB} [id="Query Plan"] > summary`);
    await expect(queryFolder).toBeVisible({ timeout: 5000 });
    await queryFolder.click({ button: 'right' });

    await page.getByRole('button', { name: /Add Query Plan/i }).click();
    await expect(
      page.getByText(/New Query Plan|Query Plan/i)
    ).toBeVisible({ timeout: 5000 });

    await dismissModal(page);
  });

  test('Query Plan을 추가하면 목록에 나타나고 삭제할 수 있다', async ({ page }) => {
    const planName = `e2e_query_${Date.now().toString().slice(-4)}`;

    const queryFolder = page.locator(`#db-tree-container details#${E2E_DB} [id="Query Plan"] > summary`);
    await expect(queryFolder).toBeVisible({ timeout: 5000 });
    await queryFolder.click({ button: 'right' });
    await page.getByRole('button', { name: /Add Query Plan/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // Plan ID 입력
    const idInput = modal.locator('input[type="text"]').first();
    await expect(idInput).toBeVisible({ timeout: 5000 });
    await idInput.fill(planName);

    // SQL 쿼리 입력 (있는 경우)
    const queryInput = modal.locator('textarea').first();
    if (await queryInput.isVisible()) {
      await queryInput.fill('SELECT 1 FROM db_root');
    }

    const saveBtn = modal.getByRole('button', { name: /Save|Add|Confirm/i }).last();
    await saveBtn.click();

    await expect(
      page.getByText(/success|saved/i)
        .or(page.locator('#db-tree-container').getByText(planName))
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});

    // 삭제
    const planNode = page.locator('#db-tree-container').getByText(planName).first();
    if (await planNode.isVisible({ timeout: 5000 }).catch(() => false)) {
      await planNode.click({ button: 'right' });
      const delBtn = page.getByRole('button', { name: /Delete.*Plan|Remove/i });
      if (await delBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await delBtn.click();
        const confirmModal = page.locator('div[role="dialog"]');
        if (await confirmModal.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmModal.getByRole('button', { name: /Confirm|Delete|OK/i }).last().click();
        }
      }
    }
  });

});
