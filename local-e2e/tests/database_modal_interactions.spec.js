const { test, expect } = require('@playwright/test');
const { login, connectToHost, openDbContextMenu, dismissModal, stopDatabase, startDatabase, E2E_DB } = require('./helpers');

/**
 * 데이터베이스 모달 인터랙션 — 실제 실행 테스트
 *
 * 비파괴(폼 검증만):
 *   - Rename Database : demodb 이름이 바뀌면 다른 테스트가 전부 깨지므로 Submit 하지 않음
 *   - Delete Database : demodb 삭제 불가
 *
 * 실제 실행:
 *   - Copy Database   → 복사본 생성 후 삭제
 *   - Check Database  → 실행 후 완료 확인
 *   - Compact Database→ 실행 후 완료 확인
 *   - Optimize Database→ 실행 후 완료 확인
 *   - Backup + Restore → 백업 후 같은 경로로 복원
 *   - Unload + Load   → 언로드 후 복사본 DB에 로드, 복사본 삭제
 *
 * Notes:
 *   - Context menu button accessible names include icon text (e.g. "check_circle Check Database")
 *     → never use exact: true for context menu buttons; use regex
 *   - Rename·Delete·Restore are DISABLED when DB is active → stopDatabase() before, startDatabase() after
 */
test.describe('Database Modal Interactions', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  // ── 헬퍼: 서브메뉴 클릭 ────────────────────────────────────────────────────

  async function openManageMenu(page, action) {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: new RegExp(action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).click();
  }

  async function waitForJobOrSuccess(page, timeout = 60000) {
    await expect(
      page.getByText(/success|complete|succeeded|완료/i)
        .or(page.locator('#sidebar-background-jobs'))
    ).toBeVisible({ timeout });
  }

  // ─── Rename: DB 중지 후 폼 검증만 (실제 Submit 안 함) ────────────────────

  test('Rename: 빈 입력 시 Submit 비활성, 입력 후 활성 확인', async ({ page }) => {
    await stopDatabase(page);
    try {
      await openManageMenu(page, 'Rename Database');

      const modal = page.locator('div[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText(/Rename/i);

      const submitBtn = modal.getByRole('button', { name: /Rename|Execute/i }).last();
      await expect(submitBtn).toBeDisabled();

      await modal.locator('input[type="text"]').first().fill(`${E2E_DB}_validation_only`);
      await expect(submitBtn).toBeEnabled();

      await dismissModal(page);
    } finally {
      await startDatabase(page);
    }
  });

  // ─── Delete: DB 중지 후 확인 다이얼로그 확인 (실제 삭제 안 함) ───────────

  test('Delete: DB 중지 후 삭제 확인 다이얼로그가 열린다', async ({ page }) => {
    await stopDatabase(page);
    try {
      await openManageMenu(page, 'Delete Database');

      const modal = page.locator('div[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText(/Delete/i);

      await dismissModal(page);
    } finally {
      await startDatabase(page);
    }
  });

  // ─── Copy Database: 실제 실행 → 복사본 삭제 ─────────────────────────────

  test('Copy Database: 복사본을 생성하고 DB 목록에 나타나면 삭제한다', async ({ page }) => {
    const copyName = `${E2E_DB}_e2e_copy`;

    await openManageMenu(page, 'Copy Database');

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Clone|Copy/i);

    const submitBtn = modal.getByRole('button', { name: /Initiate|Copy|Clone/i }).last();
    await expect(submitBtn).toBeDisabled();

    await modal.locator('input[type="text"]').first().fill(copyName);
    await expect(submitBtn).toBeEnabled();

    await submitBtn.click();

    await waitForJobOrSuccess(page, 120000);
    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});

    const copyNode = page.locator(`#db-tree-container details#${copyName} > summary`);
    await expect(copyNode).toBeVisible({ timeout: 30000 });

    // ── 정리: 복사본 중지 후 삭제 ────────────────────────────────────────────
    // Newly created DB auto-starts; must stop before delete
    await copyNode.click();
    await page.waitForTimeout(150);
    await copyNode.click({ button: 'right' });
    const stopBtn = page.getByRole('button', { name: /Stop Database/i });
    if (await stopBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stopBtn.click();
      await page.getByText(/Stopping database/i).waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      await page.getByText(/Stopping database/i).waitFor({ state: 'hidden', timeout: 30000 });
      await page.waitForTimeout(300);
    } else {
      await page.keyboard.press('Escape');
    }

    await copyNode.click({ button: 'right' });
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: /Delete Database/i }).click();

    const delModal = page.locator('div[role="dialog"]');
    await expect(delModal).toBeVisible();
    await delModal.getByRole('button', { name: /Confirm|Delete|OK/i }).last().click();

    await expect(copyNode).not.toBeVisible({ timeout: 30000 });
  });

  // ─── Check Database: 실제 실행 ───────────────────────────────────────────

  test('Check Database: 실행 후 완료 결과가 표시된다', async ({ page }) => {
    await openManageMenu(page, 'Check Database');

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Check|Integrity/i);

    await modal.getByRole('button', { name: /Run|Check|Execute/i }).last().click();
    await waitForJobOrSuccess(page, 60000);

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  // ─── Compact Database: 실제 실행 ─────────────────────────────────────────

  test('Compact Database: 실행 후 완료 결과가 표시된다', async ({ page }) => {
    await openManageMenu(page, 'Compact Database');

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Compact/i);

    await modal.getByRole('button', { name: /Run|Compact|Execute/i }).last().click();
    await waitForJobOrSuccess(page, 60000);

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  // ─── Optimize Database: 실제 실행 ────────────────────────────────────────

  test('Optimize Database: 실행하면 백그라운드 잡 또는 완료가 표시된다', async ({ page }) => {
    await openManageMenu(page, 'Optimize Database');

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    await modal.getByRole('button', { name: /Execute|Run|Optim/i }).last().click();
    await waitForJobOrSuccess(page, 60000);

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  // ─── Backup → Restore: 체인 테스트 ───────────────────────────────────────

  test('Backup 후 DB 중지 후 동일 경로로 Restore한다', async ({ page }) => {
    const backupPath = '/tmp/cubrid_e2e_backup';

    // ── 1단계: Backup (DB 실행 중 가능) ──────────────────────────────────────
    await openManageMenu(page, 'Backup Database');

    let modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Backup/i);

    const dirInput = modal.getByLabel(/Directory|Path/i).first();
    if (await dirInput.isVisible()) {
      await dirInput.clear();
      await dirInput.fill(backupPath);
    }

    await modal.getByRole('button', { name: /Run|Backup|Execute/i }).last().click();
    await waitForJobOrSuccess(page, 120000);
    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});

    // ── 2단계: DB 중지 후 Restore ────────────────────────────────────────────
    await stopDatabase(page);
    try {
      await openDbContextMenu(page);
      await page.getByRole('button', { name: 'Manage Database' }).hover();
      await page.getByRole('button', { name: /Restore Database/i }).click();

      modal = page.locator('div[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText(/Restore/i);

      const restorePathInput = modal.locator('input[type="text"]').first();
      if (await restorePathInput.isVisible()) {
        await restorePathInput.fill(backupPath);
      }

      await modal.getByRole('button', { name: /Restore|Execute|Run/i }).last().click();
      await waitForJobOrSuccess(page, 120000);

      await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
    } finally {
      await startDatabase(page);
    }
  });

  // ─── Unload → Load: 체인 테스트 ──────────────────────────────────────────

  test('Unload 후 복사본 DB를 생성해 Load하고 복사본을 삭제한다', async ({ page }) => {
    const unloadPath = '/tmp/cubrid_e2e_unload';
    const targetDb  = `${E2E_DB}_e2e_load_target`;

    // ── 1단계: Unload ('Unload Database...' — icon "upload") ─────────────────
    await openManageMenu(page, 'Unload Database');

    let modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Unload|Extract/i);

    const pathInput = modal.locator('input[type="text"]').first();
    await expect(pathInput).toBeVisible();
    await pathInput.fill(unloadPath);

    await modal.getByRole('button', { name: /Run|Unload|Execute/i }).last().click();
    await waitForJobOrSuccess(page, 120000);
    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});

    // ── 2단계: 로드 대상 DB 생성 ─────────────────────────────────────────────
    await page.locator('#tree-section-container').getByRole('button', { name: /Database/i }).click({ button: 'right' });
    await page.getByRole('button', { name: /Create Database/i }).click();

    modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    const nameInput = modal.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill(targetDb);

    // Next button enables once name + paths (auto-filled) are set
    const nextBtn = modal.getByRole('button', { name: /Next/i });
    await expect(nextBtn).toBeEnabled({ timeout: 10000 });

    for (let i = 0; i < 5; i++) {
      if (await nextBtn.isEnabled({ timeout: 1000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(300);
      } else {
        break;
      }
    }

    const finishBtn = modal.getByRole('button', { name: /Finish|Create|완료/i }).last();
    await expect(finishBtn).toBeEnabled({ timeout: 5000 });
    await finishBtn.click();

    await waitForJobOrSuccess(page, 60000);
    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});

    const targetNode = page.locator(`#db-tree-container details#${targetDb} > summary`);
    await expect(targetNode).toBeVisible({ timeout: 30000 });

    // ── 3단계: Load ('Load Database...' — icon "download") ───────────────────
    await targetNode.click({ button: 'right' });
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: /Load Database/i }).click();

    modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Load/i);

    const loadPathInput = modal.locator('input[type="text"]').first();
    if (await loadPathInput.isVisible()) {
      await loadPathInput.fill(unloadPath);
    }

    await modal.getByRole('button', { name: /Run|Load|Execute/i }).last().click();
    await waitForJobOrSuccess(page, 120000);
    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});

    // ── 4단계: 로드 대상 DB 중지 후 삭제 (정리) ──────────────────────────────
    // Target DB auto-starts after creation; must stop before delete
    await targetNode.click();
    await page.waitForTimeout(150);
    await targetNode.click({ button: 'right' });
    const stopBtn = page.getByRole('button', { name: /Stop Database/i });
    if (await stopBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stopBtn.click();
      await page.getByText(/Stopping database/i).waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      await page.getByText(/Stopping database/i).waitFor({ state: 'hidden', timeout: 30000 });
      await page.waitForTimeout(300);
    } else {
      await page.keyboard.press('Escape');
    }

    await targetNode.click({ button: 'right' });
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: /Delete Database/i }).click();

    modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: /Confirm|Delete|OK/i }).last().click();

    await expect(targetNode).not.toBeVisible({ timeout: 30000 });
  });

});
