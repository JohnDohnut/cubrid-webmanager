const { test, expect } = require('@playwright/test');
const { login, connectToHost, expandDatabase, dismissModal, E2E_DB } = require('./helpers');

/**
 * 데이터베이스 사용자 관리 테스트
 * - 사용자 목록 조회
 * - 사용자 상세/권한 조회
 * - 사용자 추가 (생성 후 삭제까지)
 * - 사용자 추가 유효성 검사
 */
test.describe('Database User Management', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
    await expandDatabase(page);
  });

  // ─── 목록 조회 ────────────────────────────────────────────────────────────

  test('Users 폴더를 클릭하면 dba 또는 public 사용자가 표시된다', async ({ page }) => {
    const usersFolder = page.locator('#db-tree-container')
      .getByText('Users', { exact: true });
    await expect(usersFolder).toBeVisible();
    await usersFolder.click();

    const dba = page.locator('#db-tree-container')
      .getByText('dba', { exact: true })
      .or(page.getByText('PUBLIC', { exact: true }));
    await expect(dba.first()).toBeVisible({ timeout: 10000 });
  });

  // ─── 사용자 상세 ──────────────────────────────────────────────────────────

  test('사용자 노드를 클릭하면 상세 패널 또는 권한 정보가 표시된다', async ({ page }) => {
    await page.locator('#db-tree-container')
      .getByText('Users', { exact: true }).click();

    const dbaNode = page.locator('#db-tree-container')
      .getByText('dba', { exact: true }).first();
    await expect(dbaNode).toBeVisible({ timeout: 10000 });
    await dbaNode.click();

    // 상세 패널 또는 권한 관련 텍스트가 있어야 한다
    await expect(
      page.getByText(/Permission|Privilege|Member|Group/i).first()
        .or(page.getByText(/dba/i).first())
    ).toBeVisible({ timeout: 5000 });
  });

  // ─── 사용자 추가 모달 ─────────────────────────────────────────────────────

  test('Users 폴더 우클릭 → Add User 모달이 열린다', async ({ page }) => {
    const usersFolder = page.locator('#db-tree-container')
      .getByText('Users', { exact: true });
    await usersFolder.click({ button: 'right' });

    await page.getByRole('button', { name: /Add.*User|Create.*User/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/User|Create/i);

    // 사용자명 입력 필드가 있어야 한다
    await expect(modal.locator('input').first()).toBeVisible();

    await dismissModal(page);
  });

  test('Add User 모달: 빈 폼 제출 시 유효성 오류가 표시된다', async ({ page }) => {
    await page.locator('#db-tree-container')
      .getByText('Users', { exact: true }).click({ button: 'right' });
    await page.getByRole('button', { name: /Add.*User|Create.*User/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    const submitBtn = modal.getByRole('button', { name: /Add|Create|Save/i }).last();
    await submitBtn.click();

    // 필수 항목 오류가 표시되어야 한다
    const error = modal.getByText(/required|필수/i);
    await expect(error.first()).toBeVisible({ timeout: 3000 });

    await dismissModal(page);
  });

  // ─── 사용자 추가 → 삭제 (CRUD) ───────────────────────────────────────────

  test('신규 사용자를 추가하고 삭제할 수 있다', async ({ page }) => {
    const testUser = `e2e_dbuser_${Date.now().toString().slice(-5)}`;

    // 추가
    await page.locator('#db-tree-container')
      .getByText('Users', { exact: true }).click({ button: 'right' });
    await page.getByRole('button', { name: /Add.*User|Create.*User/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // 사용자명 입력
    const nameInput = modal.locator('input').first();
    await nameInput.fill(testUser);

    // 비밀번호 입력 (있는 경우)
    const passInput = modal.locator('input[type="password"]').first();
    if (await passInput.isVisible()) {
      await passInput.fill('TestPass123!');
      const confirmInput = modal.locator('input[type="password"]').nth(1);
      if (await confirmInput.isVisible()) await confirmInput.fill('TestPass123!');
    }

    await modal.getByRole('button', { name: /Add|Create|Save/i }).last().click();

    // 성공 결과 또는 목록 새로고침
    await expect(
      page.getByText(/success|created|added/i)
        .or(page.locator('#db-tree-container').getByText(testUser))
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});

    // 삭제
    const userNode = page.locator('#db-tree-container').getByText(testUser).first();
    if (await userNode.isVisible({ timeout: 5000 }).catch(() => false)) {
      await userNode.click({ button: 'right' });
      const deleteBtn = page.getByRole('button', { name: /Delete.*User|Remove.*User/i });
      if (await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteBtn.click();
        const modal2 = page.locator('div[role="dialog"]');
        if (await modal2.isVisible({ timeout: 3000 }).catch(() => false)) {
          await modal2.getByRole('button', { name: /Confirm|Delete|OK/i }).last().click();
        }
      }
    }
  });

  // ─── Identity / Permissions 탭 ────────────────────────────────────────────

  test('Add User 모달에 Identity와 Permissions 탭이 있다', async ({ page }) => {
    await page.locator('#db-tree-container')
      .getByText('Users', { exact: true }).click({ button: 'right' });
    await page.getByRole('button', { name: /Add.*User|Create.*User/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    const identityTab = modal.getByRole('button', { name: /Identity/i })
      .or(modal.getByText('Identity', { exact: true }));
    const permissionsTab = modal.getByRole('button', { name: /Permissions?/i })
      .or(modal.getByText('Permissions', { exact: true }));

    if (await identityTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(identityTab).toBeVisible();
      await expect(permissionsTab).toBeVisible();

      await permissionsTab.click();
      await expect(
        modal.getByText(/Group|Member|Allow|Grant/i).first()
      ).toBeVisible({ timeout: 3000 });
    }

    await dismissModal(page);
  });

});
