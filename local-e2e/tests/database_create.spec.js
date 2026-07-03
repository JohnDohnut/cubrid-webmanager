const { test, expect } = require('@playwright/test');
const { login, connectToHost, dismissModal } = require('./helpers');

/**
 * 데이터베이스 생성 테스트
 * - Create Database 마법사 열기
 * - 필수 항목 유효성 검사
 * - 이름·문자집합·경로 설정 후 생성
 * - 생성 완료 후 DB 트리에 표시 확인
 * - 생성한 DB 삭제 (정리)
 */
test.describe('Database Create', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  // ─── 마법사 열기 ──────────────────────────────────────────────────────────

  test('DB 트리 루트 우클릭 → Create Database 마법사가 열린다', async ({ page }) => {
    await page.locator('#db-tree-container').click({ button: 'right' });
    await page.getByRole('button', { name: /Create Database/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Create Database|New database/i);

    await dismissModal(page);
  });

  // ─── 유효성 검사 ──────────────────────────────────────────────────────────

  test('데이터베이스 이름 없이 다음 단계로 이동하면 오류가 표시된다', async ({ page }) => {
    await page.locator('#db-tree-container').click({ button: 'right' });
    await page.getByRole('button', { name: /Create Database/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // 이름 미입력 상태에서 Next 또는 Finish 클릭
    const nextBtn = modal.getByRole('button', { name: /Next|Finish/i }).first();
    await nextBtn.click();

    // 필수 항목 오류가 표시되어야 한다
    const error = modal.getByText(/required|필수|name/i).first();
    await expect(error).toBeVisible({ timeout: 3000 });

    await dismissModal(page);
  });

  // ─── 생성 → 삭제 (CRUD) ──────────────────────────────────────────────────

  test('새 데이터베이스를 생성하고 트리에 나타나면 삭제한다', async ({ page }) => {
    const dbName = `e2e_db_${Date.now().toString().slice(-5)}`;

    // 마법사 열기
    await page.locator('#db-tree-container').click({ button: 'right' });
    await page.getByRole('button', { name: /Create Database/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // 1단계: 데이터베이스 이름 입력
    const nameInput = modal.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.clear();
    await nameInput.fill(dbName);

    // 단계별 Next 클릭 (마법사 구조에 따라 반복)
    for (let i = 0; i < 5; i++) {
      const nextBtn = modal.getByRole('button', { name: /Next/i });
      if (await nextBtn.isEnabled({ timeout: 1000 }).catch(() => false)) {
        await nextBtn.click();
      } else {
        break;
      }
    }

    // 마지막 단계에서 Finish 클릭
    const finishBtn = modal.getByRole('button', { name: /Finish|Create|완료/i }).last();
    await expect(finishBtn).toBeEnabled({ timeout: 5000 });
    await finishBtn.click();

    // 생성 완료 확인
    await expect(
      page.getByText(/success|created|complete/i)
        .or(page.locator('#db-tree-container').getByText(dbName))
    ).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});

    // ── 정리: 생성된 DB 삭제 — TreeNode → <details id="dbName"> > summary
    const newDbNode = page.locator(`#db-tree-container details#${dbName} > summary`);

    if (await newDbNode.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newDbNode.click({ button: 'right' });
      await page.getByRole('button', { name: 'Manage Database' }).hover();
      await page.getByRole('button', { name: 'Delete Database', exact: true }).click();

      const delModal = page.locator('div[role="dialog"]');
      await expect(delModal).toBeVisible();
      const confirmBtn = delModal.getByRole('button', { name: /Confirm|Delete|OK/i }).last();
      await confirmBtn.click();

      await expect(newDbNode).not.toBeVisible({ timeout: 15000 });
    }
  });

});
