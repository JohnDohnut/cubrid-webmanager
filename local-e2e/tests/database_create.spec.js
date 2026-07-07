const { test, expect } = require('@playwright/test');
const { login, connectToHost, dismissModal, stopDatabase } = require('./helpers');

/**
 * 데이터베이스 생성 테스트
 * - Create Database 마법사 열기
 * - 필수 항목 유효성 검사 (이름 미입력 시 Next 비활성)
 * - 이름 입력 후 생성 (genericVolPath·logVolPath는 CUBRID_DATABASES 환경변수로 자동 설정)
 * - 생성 완료 후 DB 트리에 표시 확인
 * - 생성한 DB 중지 후 삭제 (정리)
 */
test.describe('Database Create', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  // ─── 마법사 열기 ──────────────────────────────────────────────────────────

  test('DB 트리 루트 우클릭 → Create Database 마법사가 열린다', async ({ page }) => {
    await page.locator('#tree-section-container').getByRole('button', { name: /Database/i }).click({ button: 'right' });
    await page.getByRole('button', { name: /Create Database/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Create Database|New database/i);

    await dismissModal(page);
  });

  // ─── 유효성 검사 ──────────────────────────────────────────────────────────

  test('데이터베이스 이름 없이 Next 버튼은 비활성화 상태다', async ({ page }) => {
    await page.locator('#tree-section-container').getByRole('button', { name: /Database/i }).click({ button: 'right' });
    await page.getByRole('button', { name: /Create Database/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // Step 1: name is empty → Next is disabled
    // (genericVolPath & logVolPath auto-populate from CUBRID_DATABASES, but name is still required)
    const nextBtn = modal.getByRole('button', { name: /Next/i });
    await expect(nextBtn).toBeDisabled({ timeout: 5000 });

    await dismissModal(page);
  });

  // ─── 생성 → 삭제 (CRUD) ──────────────────────────────────────────────────

  test('새 데이터베이스를 생성하고 트리에 나타나면 삭제한다', async ({ page }) => {
    // Use a fixed short name to avoid #id selector issues with special chars
    const dbName = `e2etmp`;

    await page.locator('#tree-section-container').getByRole('button', { name: /Database/i }).click({ button: 'right' });
    await page.getByRole('button', { name: /Create Database/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // 1단계: DB 이름 입력
    const nameInput = modal.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.clear();
    await nameInput.fill(dbName);

    // Wait for paths to auto-populate (from CUBRID_DATABASES env) then Next enables
    const nextBtn = modal.getByRole('button', { name: /Next/i });
    await expect(nextBtn).toBeEnabled({ timeout: 10000 });

    // Step through all wizard pages
    for (let i = 0; i < 5; i++) {
      if (await nextBtn.isEnabled({ timeout: 500 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(300);
      } else {
        break;
      }
    }

    // Last step: Finish
    const finishBtn = modal.getByRole('button', { name: /Finish|Create|완료/i }).last();
    await expect(finishBtn).toBeEnabled({ timeout: 5000 });
    await finishBtn.click();

    // Creation success
    await expect(
      page.getByText(/success|created|complete/i)
        .or(page.locator('#db-tree-container').getByText(dbName))
    ).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});

    // ── 정리: 생성된 DB 중지 후 삭제 ─────────────────────────────────────────
    const newDbNode = page.locator(`#db-tree-container details#${dbName} > summary`);
    if (await newDbNode.isVisible({ timeout: 10000 }).catch(() => false)) {
      // New DB auto-starts; stop it before delete
      await stopDatabase(page, dbName);

      await newDbNode.click({ button: 'right' });
      await page.getByRole('button', { name: 'Manage Database' }).hover();
      await page.getByRole('button', { name: /Delete Database/i }).click();

      const delModal = page.locator('div[role="dialog"]');
      await expect(delModal).toBeVisible();
      const confirmBtn = delModal.getByRole('button', { name: /Confirm|Delete|OK/i }).last();
      await confirmBtn.click();

      await expect(newDbNode).not.toBeVisible({ timeout: 15000 });
    }
  });

});
