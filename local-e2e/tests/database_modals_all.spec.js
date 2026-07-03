const { test, expect } = require('@playwright/test');
const { login, connectToHost, expandDatabase, dismissModal, E2E_DB } = require('./helpers');

/**
 * 데이터베이스 전체 모달 스위프 테스트
 *
 * 모든 컨텍스트 메뉴 액션을 순서대로 열고 모달이 정상 렌더링되는지 확인합니다.
 * 실제 실행하지 않고 열기 → 닫기만 합니다.
 */
test.describe('Database All Modals', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  // ─── Manage Database 서브메뉴 모달 ───────────────────────────────────────

  const manageActions = [
    { label: 'Database Unload',   expected: /Extract Database Data|Unload/i },
    { label: 'Database Load',     expected: /Database Load|Load/i           },
    { label: 'Check Database',    expected: /Check Database|Check/i         },
    { label: 'Compact Database',  expected: /Compact/i                      },
    { label: 'Optimize Database', expected: /Optim/i                        },
    { label: 'Copy Database',     expected: /Clone|Copy/i                   },
    { label: 'Restore Database',  expected: /Restore/i                      },
    { label: 'Backup Database',   expected: /Database Backup|Backup/i       },
    { label: 'Delete Database',   expected: /Delete/i                       },
    { label: 'Rename Database',   expected: /Rename/i                       },
  ];

  for (const action of manageActions) {
    test(`Manage Database → ${action.label} 모달이 열린다`, async ({ page }) => {
      const dbNode = page.locator('#db-tree-container')
        .locator('div').filter({ hasText: new RegExp(`^${E2E_DB}$`) }).first();
      await expect(dbNode).toBeVisible({ timeout: 10000 });
      await dbNode.click({ button: 'right' });

      await page.getByRole('button', { name: 'Manage Database' }).hover();
      await page.getByRole('button', { name: action.label, exact: true }).click();

      const modal = page.locator('div[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
      await expect(modal).toContainText(action.expected);

      const closeBtn = modal.getByRole('button', { name: /Discard|Cancel|Close/i }).first();
      await closeBtn.click();
      await expect(modal).not.toBeVisible({ timeout: 5000 });
    });
  }

  // ─── Database Info 서브메뉴 모달 ─────────────────────────────────────────

  const infoActions = [
    { label: 'Lock Information', expected: /Lock/i         },
    { label: 'Transaction Info', expected: /Transaction/i  },
    { label: 'Param Dump',       expected: /Param|Database Info/i },
    { label: 'Plan Dump',        expected: /Plan/i         },
  ];

  for (const action of infoActions) {
    test(`Database Info → ${action.label} 모달이 열린다`, async ({ page }) => {
      const dbNode = page.locator('#db-tree-container')
        .locator('div').filter({ hasText: new RegExp(`^${E2E_DB}$`) }).first();
      await expect(dbNode).toBeVisible({ timeout: 10000 });
      await dbNode.click({ button: 'right' });

      await page.getByRole('button', { name: 'Database Info' }).hover();
      await page.getByRole('button', { name: action.label, exact: true }).click();

      const modal = page.locator('div[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
      await expect(modal).toContainText(action.expected);

      const closeBtn = modal.getByRole('button', { name: /Discard|Cancel|Close/i }).first();
      await closeBtn.click();
      await expect(modal).not.toBeVisible({ timeout: 5000 });
    });
  }

  // ─── 직접 액션 ────────────────────────────────────────────────────────────

  test('Properties 모달이 열린다', async ({ page }) => {
    const dbNode = page.locator('#db-tree-container')
      .locator('div').filter({ hasText: new RegExp(`^${E2E_DB}$`) }).first();
    await expect(dbNode).toBeVisible({ timeout: 10000 });
    await dbNode.click({ button: 'right' });
    await page.getByRole('button', { name: 'Properties', exact: true }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal).toContainText(/Properties/i);
    await dismissModal(page);
  });

  // ─── Job Automation 모달 ──────────────────────────────────────────────────

  test('Add Backup Plan 모달이 열린다', async ({ page }) => {
    await expandDatabase(page);

    const backupFolder = page.locator('#db-tree-container')
      .getByText('Backup Plan', { exact: true });
    await expect(backupFolder).toBeVisible({ timeout: 5000 });
    await backupFolder.click({ button: 'right' });

    await page.getByRole('button', { name: 'Add Backup Plan' }).click();
    await expect(page.getByText(/New Backup Plan|Backup Plan/i)).toBeVisible();
    await dismissModal(page);
  });

  test('Auto Backup Log 모달이 열린다', async ({ page }) => {
    await expandDatabase(page);

    const backupFolder = page.locator('#db-tree-container')
      .getByText('Backup Plan', { exact: true });
    await expect(backupFolder).toBeVisible({ timeout: 5000 });
    await backupFolder.click({ button: 'right' });

    await page.getByRole('button', { name: 'Auto Backup Log' }).click();
    await expect(page.getByText(/Auto Backup Log/i)).toBeVisible();
    await dismissModal(page);
  });

  test('Add Query Plan 모달이 열린다', async ({ page }) => {
    await expandDatabase(page);

    const queryFolder = page.locator('#db-tree-container')
      .getByText('Query Plan', { exact: true });
    await expect(queryFolder).toBeVisible({ timeout: 5000 });
    await queryFolder.click({ button: 'right' });

    await page.getByRole('button', { name: 'Add Query Plan' }).click();
    await expect(page.getByText(/New Query Plan|Query Plan/i)).toBeVisible();
    await dismissModal(page);
  });

  // ─── Space 관련 모달 ──────────────────────────────────────────────────────

  test('Add Volume 모달이 열린다', async ({ page }) => {
    await expandDatabase(page);

    const spaceFolder = page.locator('#db-tree-container')
      .getByText('Space', { exact: true });
    await expect(spaceFolder).toBeVisible({ timeout: 5000 });
    await spaceFolder.click({ button: 'right' });

    await page.getByRole('button', { name: 'Add Volume' }).click();
    await expect(page.getByText(/Add Volume/i)).toBeVisible();
    await dismissModal(page);
  });

  test('Set Automation Volume 모달이 열린다', async ({ page }) => {
    await expandDatabase(page);

    const spaceFolder = page.locator('#db-tree-container')
      .getByText('Space', { exact: true });
    await expect(spaceFolder).toBeVisible({ timeout: 5000 });
    await spaceFolder.click({ button: 'right' });

    await page.getByRole('button', { name: 'Set Automation Volume' }).click();
    await expect(page.getByText(/Automation Volume/i)).toBeVisible();
    await dismissModal(page);
  });

});
