const { test, expect } = require('@playwright/test');
const { login, connectToHost, openDbContextMenu, dismissModal, E2E_DB } = require('./helpers');

/**
 * 데이터베이스 라이프사이클 테스트
 * - 데이터베이스 시작/중지 토글 (컨텍스트 메뉴로 상태 판별 — StatusIndicator는 텍스트 없음)
 * - 데이터베이스 상태 표시 확인 (span.inline-flex 도트로 확인)
 * - 데이터베이스 생성 모달 열기
 * - 데이터베이스 속성 패널 열기 (dialog 아닌 패널로 렌더링됨)
 */
test.describe('Database Lifecycle', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  // ─── 상태 표시 ────────────────────────────────────────────────────────────

  test('DB 목록에서 각 데이터베이스의 On/Off 상태가 표시된다', async ({ page }) => {
    const dbTree = page.locator('#db-tree-container');
    await expect(dbTree).toBeVisible();

    // StatusIndicator renders a colored dot (span.inline-flex) — no text label
    const statusBadge = dbTree.locator('span.inline-flex').first();
    await expect(statusBadge).toBeVisible({ timeout: 10000 });
  });

  // ─── 시작/중지 토글 ───────────────────────────────────────────────────────

  test('demodb 시작/중지를 토글하면 상태가 바뀐다', async ({ page }) => {
    // StatusIndicator renders only a dot — no text. Determine state via context menu.
    const dbSummary = page.locator(`#db-tree-container details#${E2E_DB} > summary`);
    await expect(dbSummary).toBeVisible({ timeout: 10000 });

    // Open context menu to check current state
    await dbSummary.click();
    await page.waitForTimeout(150);
    await dbSummary.click({ button: 'right' });

    const stopBtn  = page.getByRole('button', { name: /Stop Database/i });
    const isRunning = await stopBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (isRunning) {
      await stopBtn.click();
      await page.getByText(/Stopping database/i).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      await page.getByText(/Stopping database/i).waitFor({ state: 'hidden', timeout: 30000 });
    } else {
      await page.getByRole('button', { name: /Start Database/i }).click();
      await page.getByText(/Starting database/i).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      await page.getByText(/Starting database/i).waitFor({ state: 'hidden', timeout: 30000 });
    }
    await page.waitForTimeout(500);

    // Verify state changed: opposite action is now available
    await dbSummary.click();
    await page.waitForTimeout(150);
    await dbSummary.click({ button: 'right' });

    if (isRunning) {
      // Was running → now stopped → Start Database should appear
      await expect(page.getByRole('button', { name: /Start Database/i })).toBeVisible({ timeout: 10000 });
    } else {
      // Was stopped → now running → Stop Database should appear
      await expect(page.getByRole('button', { name: /Stop Database/i })).toBeVisible({ timeout: 10000 });
    }
    await page.keyboard.press('Escape');

    // ── 복원: 원래 상태로 되돌림 ─────────────────────────────────────────────
    await dbSummary.click();
    await page.waitForTimeout(150);
    await dbSummary.click({ button: 'right' });

    if (isRunning) {
      // Restore: start the DB again
      const startBtn = page.getByRole('button', { name: /Start Database/i });
      if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await startBtn.click();
        await page.getByText(/Starting database/i).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await page.getByText(/Starting database/i).waitFor({ state: 'hidden', timeout: 30000 });
      } else {
        await page.keyboard.press('Escape');
      }
    } else {
      // Restore: stop the DB again
      const sBtn = page.getByRole('button', { name: /Stop Database/i });
      if (await sBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sBtn.click();
        await page.getByText(/Stopping database/i).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await page.getByText(/Stopping database/i).waitFor({ state: 'hidden', timeout: 30000 });
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });

  // ─── 생성 모달 ────────────────────────────────────────────────────────────

  test('DB 트리 루트 우클릭으로 Create Database 모달이 열린다', async ({ page }) => {
    // Right-click the "Database" tab button in the tree section header
    // Tab accessible name: "database Database" (icon "database" + label "Database")
    await page.locator('#tree-section-container').getByRole('button', { name: /Database/i }).click({ button: 'right' });
    await page.getByRole('button', { name: /Create Database/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Create Database|New database/i);

    await dismissModal(page);
  });

  // ─── 속성 패널 ────────────────────────────────────────────────────────────

  test('demodb 우클릭 → Properties 패널이 열린다', async ({ page }) => {
    // Properties opens a connection config panel, not a dialog
    await openDbContextMenu(page);
    await page.getByRole('button', { name: /Properties/i }).click();

    // Panel shows DB connection settings (Broker IP, Service Port, etc.)
    await expect(
      page.getByText(/Broker IP|Service Port|Connection|Text Encoding/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

});
